import type { Express, Request, Response } from 'express';
import type { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { storage } from './storage';
import { requireAuth, signToken } from './auth';
import { registerSchema, loginSchema } from '@shared/schema';
import { ZodError } from 'zod';

const BCRYPT_ROUNDS = 10;

// ─── Helper ──────────────────────────────────────────────────────────────────
function safeUser(user: { id: number; username: string; wins: number; losses: number; currentStreak: number; bestStreak: number; totalPoints: number; createdAt: number; passwordHash: string }) {
  const { passwordHash: _pw, ...safe } = user;
  return safe;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Socket.io ───────────────────────────────────────────────────────────────
  const io = new SocketServer(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_duel', (duelId: string) => {
      socket.join(`duel:${duelId}`);
      console.log(`Socket ${socket.id} joined duel:${duelId}`);

      // Notify the room that a player joined
      const duel = storage.getDuelById(duelId);
      if (duel) {
        io.to(`duel:${duelId}`).emit('duel_state', duel);
      }
    });

    socket.on('player_answer', (data: { duelId: string; questionIndex: number; answer: string; timeMs: number }) => {
      // Broadcast answer event to the duel room so both clients can react
      socket.to(`duel:${data.duelId}`).emit('opponent_answered', {
        questionIndex: data.questionIndex,
        timeMs: data.timeMs,
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // TODO: Full game room logic will be integrated from brain module
  });

  // ── Auth Routes ─────────────────────────────────────────────────────────────

  // POST /api/auth/register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { username, password } = registerSchema.parse(req.body);

      const existing = storage.getUserByUsername(username);
      if (existing) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const user = storage.createUser({ username, passwordHash });
      const token = signToken(user.id, user.username);

      res.status(201).json({ token, user: safeUser(user) });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: err.errors[0].message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);

      const user = storage.getUserByUsername(username);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = signToken(user.id, user.username);
      res.json({ token, user: safeUser(user) });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: err.errors[0].message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // GET /api/auth/me
  app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const user = storage.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(safeUser(user));
  });

  // ── User Routes ──────────────────────────────────────────────────────────────

  // GET /api/users/:username
  app.get('/api/users/:username', (req: Request, res: Response) => {
    const user = storage.getUserByUsername(req.params.username as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(safeUser(user));
  });

  // ── Duel Routes ──────────────────────────────────────────────────────────────

  // POST /api/duels — create a new duel
  app.post('/api/duels', requireAuth, (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const duelId = randomUUID();
    const duel = storage.createDuel(duelId, userId);
    res.status(201).json({ duelId: duel.id, duel });
  });

  // GET /api/duels/:id — get duel state
  app.get('/api/duels/:id', (req: Request, res: Response) => {
    const duel = storage.getDuelById(req.params.id as string);
    if (!duel) {
      res.status(404).json({ error: 'Duel not found' });
      return;
    }
    res.json(duel);
  });

  // GET /api/duels/:id/share — share card data for completed duel
  app.get('/api/duels/:id/share', (req: Request, res: Response) => {
    const duel = storage.getDuelById(req.params.id as string);
    if (!duel) {
      res.status(404).json({ error: 'Duel not found' });
      return;
    }
    if (duel.status !== 'completed') {
      res.status(400).json({ error: 'Duel is not completed yet' });
      return;
    }

    let shareData: any = {};
    if (duel.shareCardData) {
      try {
        shareData = JSON.parse(duel.shareCardData);
      } catch {
        shareData = {};
      }
    }

    // Build enriched share card
    const player1 = duel.player1Id ? storage.getUserById(duel.player1Id) : null;
    const player2 = duel.player2Id ? storage.getUserById(duel.player2Id) : null;
    const winner = duel.winnerId ? storage.getUserById(duel.winnerId) : null;

    res.json({
      duelId: duel.id,
      player1: player1 ? { id: player1.id, username: player1.username } : null,
      player2: player2 ? { id: player2.id, username: player2.username } : null,
      winner: winner ? { id: winner.id, username: winner.username } : null,
      player1Score: duel.player1Score,
      player2Score: duel.player2Score,
      completedAt: duel.completedAt,
      ...shareData,
    });
  });

  // POST /api/duels/:id/join — join an existing waiting duel
  app.post('/api/duels/:id/join', requireAuth, (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const duel = storage.getDuelById(req.params.id as string);
    if (!duel) {
      res.status(404).json({ error: 'Duel not found' });
      return;
    }
    if (duel.status !== 'waiting') {
      res.status(400).json({ error: 'Duel is not open for joining' });
      return;
    }
    if (duel.player1Id === userId) {
      res.status(400).json({ error: 'Cannot join your own duel' });
      return;
    }

    const updated = storage.updateDuel(duel.id, {
      player2Id: userId,
      status: 'active',
    });

    // Notify players via Socket.io
    io.to(`duel:${duel.id}`).emit('duel_started', updated);

    res.json(updated);
  });

  // POST /api/duels/:id/complete — finalize a duel
  app.post('/api/duels/:id/complete', requireAuth, (req: Request, res: Response) => {
    const duel = storage.getDuelById(req.params.id as string);
    if (!duel) {
      res.status(404).json({ error: 'Duel not found' });
      return;
    }
    if (duel.status === 'completed') {
      res.status(400).json({ error: 'Duel already completed' });
      return;
    }

    const { winnerId, player1Score, player2Score, roundsData, shareCardData } = req.body;

    const updated = storage.updateDuel(duel.id, {
      status: 'completed',
      winnerId: winnerId ?? null,
      player1Score: player1Score ?? duel.player1Score,
      player2Score: player2Score ?? duel.player2Score,
      roundsData: typeof roundsData === 'object' ? JSON.stringify(roundsData) : (roundsData ?? duel.roundsData),
      shareCardData: typeof shareCardData === 'object' ? JSON.stringify(shareCardData) : (shareCardData ?? null),
      completedAt: Date.now(),
    });

    // Update player stats
    if (winnerId && duel.player1Id && duel.player2Id) {
      const p1Won = winnerId === duel.player1Id;
      storage.updateUserStats(duel.player1Id, p1Won, p1Won ? (player1Score ?? 0) : 0);
      storage.updateUserStats(duel.player2Id, !p1Won, !p1Won ? (player2Score ?? 0) : 0);
    }

    // Notify via Socket.io
    io.to(`duel:${duel.id}`).emit('duel_completed', updated);

    res.json(updated);
  });

  // ── Leaderboard Routes ────────────────────────────────────────────────────────

  // GET /api/leaderboard — top 50 players by wins
  app.get('/api/leaderboard', (_req: Request, res: Response) => {
    const players = storage.getLeaderboard(50);
    res.json(players.map(safeUser));
  });

  // GET /api/leaderboard/weekly — top 50 (same data, weekly filter placeholder)
  app.get('/api/leaderboard/weekly', (_req: Request, res: Response) => {
    // For MVP, return the same top 50. A true weekly filter can use
    // createdAt or a separate weekly_stats table in a later iteration.
    const players = storage.getLeaderboard(50);
    res.json(players.map(safeUser));
  });

  // ── Stats Route ───────────────────────────────────────────────────────────────

  // GET /api/stats
  app.get('/api/stats', (_req: Request, res: Response) => {
    res.json({
      totalDuels: storage.getTotalDuels(),
      activeDuels: storage.getActiveDuels(),
      totalPlayers: storage.getTotalPlayers(),
    });
  });

  return httpServer;
}
