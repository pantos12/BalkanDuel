import type { Express, Request, Response } from 'express';
import type { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { storage } from './storage';
import { requireAuth, signToken, verifyToken } from './auth';
import { registerSchema, loginSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { setupGameRooms } from './brain/gameRooms';

const BCRYPT_ROUNDS = 10;

// ─── Helper ──────────────────────────────────────────────────────────────────
function safeUser(user: { id: number; username: string; wins: number; losses: number; currentStreak: number; bestStreak: number; totalPoints: number; createdAt: number; passwordHash: string }) {
  const { passwordHash: _pw, ...safe } = user;
  return safe;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // Initialize storage (creates tables for Postgres if needed)
  // Wrapped in try/catch so a bad DATABASE_URL doesn't crash the server on startup.
  // The error will surface on the first actual DB call instead.
  try {
    await storage.init();
  } catch (err) {
    console.error('[storage] init() failed:', (err as Error).message);
  }

  // ── Socket.io ───────────────────────────────────────────────────────────────
  const io = new SocketServer(httpServer, {
    cors: { origin: '*' },
  });

  // JWT auth middleware for Socket.io — decode token and inject userId/username
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        socket.data.userId = payload.userId;
        socket.data.username = payload.username;
      }
    }
    // Allow connection even without auth (spectators, etc.)
    // The brain's handlers will reject unauthorized actions.
    next();
  });

  // Wire in the brain's full game room handler
  setupGameRooms(io);

  // ── Auth Routes ─────────────────────────────────────────────────────────────

  // POST /api/auth/register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { username, password } = registerSchema.parse(req.body);

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        res.status(409).json({ error: 'Username already taken' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const user = await storage.createUser({ username, passwordHash });
      const token = signToken(user.id, user.username);

      res.status(201).json({ token, user: safeUser(user) });
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: err.errors[0].message });
      } else {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // POST /api/auth/login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(username);
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
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // GET /api/auth/me
  app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const user = await storage.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(safeUser(user));
  });

  // ── User Routes ──────────────────────────────────────────────────────────────

  // GET /api/users/:username
  app.get('/api/users/:username', async (req: Request, res: Response) => {
    const user = await storage.getUserByUsername(req.params.username as string);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(safeUser(user));
  });

  // ── Duel Routes ──────────────────────────────────────────────────────────────

  // POST /api/duels — create a new duel
  app.post('/api/duels', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const duelId = randomUUID();
    const duel = await storage.createDuel(duelId, userId);
    res.status(201).json({ duelId: duel.id, duel });
  });

  // GET /api/duels/:id — get duel state
  app.get('/api/duels/:id', async (req: Request, res: Response) => {
    const duel = await storage.getDuelById(req.params.id as string);
    if (!duel) {
      res.status(404).json({ error: 'Duel not found' });
      return;
    }
    res.json(duel);
  });

  // GET /api/duels/:id/share — share card data for completed duel
  app.get('/api/duels/:id/share', async (req: Request, res: Response) => {
    const duel = await storage.getDuelById(req.params.id as string);
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
    const player1 = duel.player1Id ? await storage.getUserById(duel.player1Id) : null;
    const player2 = duel.player2Id ? await storage.getUserById(duel.player2Id) : null;
    const winner = duel.winnerId ? await storage.getUserById(duel.winnerId) : null;

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
  app.post('/api/duels/:id/join', requireAuth, async (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const duel = await storage.getDuelById(req.params.id as string);
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

    const updated = await storage.updateDuel(duel.id, {
      player2Id: userId,
      status: 'active',
    });

    // Notify players via Socket.io
    io.to(`duel:${duel.id}`).emit('duel_started', updated);

    res.json(updated);
  });

  // POST /api/duels/:id/complete — finalize a duel
  app.post('/api/duels/:id/complete', requireAuth, async (req: Request, res: Response) => {
    const duel = await storage.getDuelById(req.params.id as string);
    if (!duel) {
      res.status(404).json({ error: 'Duel not found' });
      return;
    }
    if (duel.status === 'completed') {
      res.status(400).json({ error: 'Duel already completed' });
      return;
    }

    const { winnerId, player1Score, player2Score, roundsData, shareCardData } = req.body;

    const updated = await storage.updateDuel(duel.id, {
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
      await storage.updateUserStats(duel.player1Id, p1Won, p1Won ? (player1Score ?? 0) : 0);
      await storage.updateUserStats(duel.player2Id, !p1Won, !p1Won ? (player2Score ?? 0) : 0);
    }

    // Notify via Socket.io
    io.to(`duel:${duel.id}`).emit('duel_completed', updated);

    res.json(updated);
  });

  // ── Leaderboard Routes ────────────────────────────────────────────────────────

  // GET /api/leaderboard — top 50 players by wins
  app.get('/api/leaderboard', async (_req: Request, res: Response) => {
    const players = await storage.getLeaderboard(50);
    res.json(players.map(safeUser));
  });

  // GET /api/leaderboard/weekly — top 50 (same data, weekly filter placeholder)
  app.get('/api/leaderboard/weekly', async (_req: Request, res: Response) => {
    const players = await storage.getLeaderboard(50);
    res.json(players.map(safeUser));
  });

  // ── Stats Route ───────────────────────────────────────────────────────────────

  // GET /api/stats
  app.get('/api/stats', async (_req: Request, res: Response) => {
    res.json({
      totalDuels: await storage.getTotalDuels(),
      activeDuels: await storage.getActiveDuels(),
      totalPlayers: await storage.getTotalPlayers(),
    });
  });

  return httpServer;
}
