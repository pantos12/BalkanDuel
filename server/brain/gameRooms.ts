// ============================================================
// Balkan Duel — Socket.io Game Room Handler
// ============================================================

import { Server, Socket } from 'socket.io';
import { DuelState } from './duelEngine';
import { duelEngine } from './duelEngine';
import { matchmakingQueue, challengeManager } from './matchmaker';

// ─────────────────────────────────────────────
// Types for Socket.io events
// ─────────────────────────────────────────────

interface AuthenticatedSocket extends Socket {
  data: {
    userId: number;
    username: string;
    duelId?: string;
  };
}

interface RoundStartPayload {
  duelId: string;
  round: number;
  totalRounds: number;
  question: {
    id: string;
    text: string;
    options: [string, string, string, string];
    category: string;
    difficulty: string;
    timeLimit: number;
  };
}

interface RoundResultPayload {
  duelId: string;
  round: number;
  winner: 0 | 1 | null;
  p1Points: number;
  p2Points: number;
  correctIndex: number;
  funFact?: string;
  p1Score: number;
  p2Score: number;
  p1RoundsWon: number;
  p2RoundsWon: number;
}

interface DuelOverPayload {
  duelId: string;
  winner: 0 | 1 | null;
  winnerUsername: string | null;
  p1Score: number;
  p2Score: number;
  p1RoundsWon: number;
  p2RoundsWon: number;
  shareCards: {
    p1: ReturnType<typeof duelEngine.generateShareCard>;
    p2: ReturnType<typeof duelEngine.generateShareCard>;
  };
}

// ─────────────────────────────────────────────
// In-memory duel storage
// ─────────────────────────────────────────────

// Lightweight in-memory store for active duels
// The storage parameter allows the backend agent to inject a real store
interface DuelStorage {
  get(duelId: string): DuelState | undefined;
  set(duelId: string, state: DuelState): void;
  delete(duelId: string): void;
}

class InMemoryDuelStorage implements DuelStorage {
  private readonly store = new Map<string, DuelState>();

  get(duelId: string): DuelState | undefined {
    return this.store.get(duelId);
  }

  set(duelId: string, state: DuelState): void {
    this.store.set(duelId, state);
  }

  delete(duelId: string): void {
    this.store.delete(duelId);
  }
}

// ─────────────────────────────────────────────
// Active round timers — tracked per duelId
// ─────────────────────────────────────────────

const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearDuelTimer(duelId: string): void {
  const timer = activeTimers.get(duelId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(duelId);
  }
}

// ─────────────────────────────────────────────
// Main setup function
// ─────────────────────────────────────────────

export function setupGameRooms(
  io: Server,
  storage: DuelStorage = new InMemoryDuelStorage()
): void {
  // ──────────────────────────────────────────
  // Helper: broadcast current duel state to room
  // ──────────────────────────────────────────
  function broadcastState(duelId: string, state: DuelState): void {
    io.to(duelId).emit('duel_state', state);
  }

  // ──────────────────────────────────────────
  // Round lifecycle
  // ──────────────────────────────────────────
  function runRound(duelId: string): void {
    const state = storage.get(duelId);
    if (!state) return;
    if (state.status === 'duel_over') return;

    // Begin countdown (3 seconds)
    let countdownState = duelEngine.beginCountdown(state);
    storage.set(duelId, countdownState);
    io.to(duelId).emit('countdown', { duelId, seconds: 3 });

    const countdownTimer = setTimeout(() => {
      const stateAfterCountdown = storage.get(duelId);
      if (!stateAfterCountdown || stateAfterCountdown.status === 'duel_over') return;

      // Start the actual round
      let { state: roundState, question } = duelEngine.startRound(stateAfterCountdown);
      roundState = duelEngine.clearEmotes(roundState);
      storage.set(duelId, roundState);

      const roundStartPayload: RoundStartPayload = {
        duelId,
        round: roundState.currentRound,
        totalRounds: roundState.totalRounds,
        question: {
          id: question.id,
          text: question.text,
          options: question.options,
          category: question.category,
          difficulty: question.difficulty,
          timeLimit: question.timeLimit,
        },
      };

      io.to(duelId).emit('round_start', roundStartPayload);
      broadcastState(duelId, roundState);

      // Set timeout for the question time limit
      const questionTimerMs = question.timeLimit * 1000;
      const questionTimer = setTimeout(() => {
        handleRoundTimeout(duelId);
      }, questionTimerMs);

      activeTimers.set(duelId, questionTimer);
    }, 3000);

    activeTimers.set(`${duelId}_countdown`, countdownTimer);
  }

  function handleRoundTimeout(duelId: string): void {
    const state = storage.get(duelId);
    if (!state || state.status !== 'round_active') return;

    // Force-submit null (timeout) for any player who hasn't answered
    let currentState = state;
    for (const player of currentState.players) {
      const hasAnswered = player.answers.some(
        (a) => a.questionId === currentState.currentQuestion?.id
      );
      if (!hasAnswered) {
        try {
          const { state: updated } = duelEngine.submitAnswer(
            currentState,
            player.userId,
            null,
            Date.now()
          );
          currentState = updated;
        } catch {
          // Player already answered — ignore
        }
      }
    }

    storage.set(duelId, currentState);
    finalizeRound(duelId, currentState);
  }

  function finalizeRound(duelId: string, state: DuelState): void {
    clearDuelTimer(duelId);
    clearDuelTimer(`${duelId}_countdown`);

    let resolved = duelEngine.resolveRound(state);
    storage.set(duelId, resolved);

    const lastResult = resolved.roundResults[resolved.roundResults.length - 1];
    const question = resolved.currentQuestion!;

    const roundResultPayload: RoundResultPayload = {
      duelId,
      round: resolved.currentRound,
      winner: lastResult.winner,
      p1Points: lastResult.p1Points,
      p2Points: lastResult.p2Points,
      correctIndex: question.correctIndex,
      funFact: question.funFact,
      p1Score: resolved.players[0].score,
      p2Score: resolved.players[1].score,
      p1RoundsWon: resolved.players[0].roundsWon,
      p2RoundsWon: resolved.players[1].roundsWon,
    };

    io.to(duelId).emit('round_result', roundResultPayload);
    broadcastState(duelId, resolved);

    // Pause 2 seconds then either continue or end duel
    setTimeout(() => {
      const latestState = storage.get(duelId);
      if (!latestState) return;

      if (duelEngine.checkDuelOver(latestState)) {
        endDuel(duelId, latestState);
      } else {
        runRound(duelId);
      }
    }, 2000);
  }

  function endDuel(duelId: string, state: DuelState): void {
    const finalState = duelEngine.resolveDuel(state);
    storage.set(duelId, finalState);

    const winnerUsername =
      finalState.winner !== null ? finalState.players[finalState.winner].username : null;

    const duelOverPayload: DuelOverPayload = {
      duelId,
      winner: finalState.winner,
      winnerUsername,
      p1Score: finalState.players[0].score,
      p2Score: finalState.players[1].score,
      p1RoundsWon: finalState.players[0].roundsWon,
      p2RoundsWon: finalState.players[1].roundsWon,
      shareCards: {
        p1: duelEngine.generateShareCard(finalState, finalState.players[0].userId),
        p2: duelEngine.generateShareCard(finalState, finalState.players[1].userId),
      },
    };

    io.to(duelId).emit('duel_over', duelOverPayload);
    broadcastState(duelId, finalState);
  }

  // ──────────────────────────────────────────
  // Start a duel after both players join
  // ──────────────────────────────────────────
  function startDuelForRoom(duelId: string): void {
    const state = storage.get(duelId);
    if (!state) return;
    runRound(duelId);
  }

  // ──────────────────────────────────────────
  // Track which sockets have joined which duel room
  // duelId → Set<socketId>
  // ──────────────────────────────────────────
  const duelRoomMembers = new Map<string, Set<string>>();
  // socketId → duelId (reverse lookup for disconnect)
  const socketDuelMap = new Map<string, string>();

  // ──────────────────────────────────────────
  // Socket.io Connection Handler
  // ──────────────────────────────────────────
  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;

    // ─── Extract user identity from handshake auth ───
    // The backend agent should inject userId/username via socket.handshake.auth
    // or via middleware. We read from socket.data (set by middleware) with fallback.
    const userId: number = (socket.handshake.auth?.userId as number) ?? socket.data?.userId ?? 0;
    const username: string =
      (socket.handshake.auth?.username as string) ?? socket.data?.username ?? `user_${userId}`;

    socket.data.userId = userId;
    socket.data.username = username;

    // ─── join_lobby ───
    socket.on('join_lobby', () => {
      if (!userId) {
        socket.emit('error', { message: 'Authentication required to join lobby.' });
        return;
      }

      matchmakingQueue.addToQueue(userId, username);

      socket.emit('lobby_joined', {
        queueSize: matchmakingQueue.getQueueSize(),
      });

      // Try to match immediately
      const match = matchmakingQueue.tryMatch();
      if (match) {
        const duelState = duelEngine.createDuel(
          match.player1.userId,
          match.player1.username,
          match.player2.userId,
          match.player2.username
        );
        storage.set(duelState.duelId, duelState);

        // Notify both players
        io.to(`user_${match.player1.userId}`).emit('match_found', { duelId: duelState.duelId });
        io.to(`user_${match.player2.userId}`).emit('match_found', { duelId: duelState.duelId });
      }
    });

    // ─── leave_lobby ───
    socket.on('leave_lobby', () => {
      matchmakingQueue.removeFromQueue(userId);
      socket.emit('lobby_left', {});
    });

    // ─── challenge_user ───
    socket.on('challenge_user', (data: { targetUsername: string }) => {
      if (!data?.targetUsername) {
        socket.emit('error', { message: 'targetUsername is required.' });
        return;
      }

      const challenge = challengeManager.issueChallenge(userId, username, data.targetUsername);

      // Notify the target player via their personal room
      io.to(`user_${data.targetUsername.toLowerCase()}`).emit('challenge_received', {
        challengerUsername: username,
        challengerId: userId,
        expiresAt: challenge.expiresAt,
      });

      socket.emit('challenge_sent', {
        targetUsername: data.targetUsername,
        expiresAt: challenge.expiresAt,
      });
    });

    // ─── accept_challenge ───
    socket.on('accept_challenge', () => {
      const challenge = challengeManager.acceptChallenge(username);
      if (!challenge) {
        socket.emit('error', { message: 'No pending challenge or challenge expired.' });
        return;
      }

      // Create duel: challenger is player1, accepter is player2
      const duelState = duelEngine.createDuel(
        challenge.challengerId,
        challenge.challengerUsername,
        userId,
        username
      );
      storage.set(duelState.duelId, duelState);

      // Notify both players
      io.to(`user_${challenge.challengerId}`).emit('match_found', { duelId: duelState.duelId });
      socket.emit('match_found', { duelId: duelState.duelId });
    });

    // ─── join_duel ───
    socket.on('join_duel', (data: { duelId: string }) => {
      if (!data?.duelId) {
        socket.emit('error', { message: 'duelId is required.' });
        return;
      }

      const duelId = data.duelId;
      const state = storage.get(duelId);
      if (!state) {
        socket.emit('error', { message: `Duel ${duelId} not found.` });
        return;
      }

      // Verify the player belongs to this duel
      const isParticipant = state.players.some((p) => p.userId === userId);
      if (!isParticipant) {
        socket.emit('error', { message: 'You are not a participant of this duel.' });
        return;
      }

      socket.join(duelId);
      socket.data.duelId = duelId;
      socketDuelMap.set(socket.id, duelId);

      // Track room members
      if (!duelRoomMembers.has(duelId)) {
        duelRoomMembers.set(duelId, new Set());
      }
      duelRoomMembers.get(duelId)!.add(socket.id);

      socket.emit('duel_joined', { duelId });
      broadcastState(duelId, state);

      // Join personal user room for direct targeting
      socket.join(`user_${userId}`);
      socket.join(`user_${username.toLowerCase()}`);

      // If both players have joined, start the duel
      const members = duelRoomMembers.get(duelId)!;
      if (members.size >= 2 && state.status === 'waiting') {
        startDuelForRoom(duelId);
      }
    });

    // ─── submit_answer ───
    socket.on('submit_answer', (data: { duelId: string; answerIndex: number }) => {
      if (!data?.duelId || data.answerIndex === undefined) {
        socket.emit('error', { message: 'duelId and answerIndex are required.' });
        return;
      }

      const state = storage.get(data.duelId);
      if (!state) {
        socket.emit('error', { message: 'Duel not found.' });
        return;
      }
      if (state.status !== 'round_active') {
        socket.emit('error', { message: 'Round is not active.' });
        return;
      }

      try {
        const { state: updatedState, isCorrect, points } = duelEngine.submitAnswer(
          state,
          userId,
          data.answerIndex,
          Date.now()
        );
        storage.set(data.duelId, updatedState);

        // Confirm to the answering player
        socket.emit('answer_received', { isCorrect, points });

        // If both players have now answered, finalize the round immediately
        if (duelEngine.checkRoundComplete(updatedState)) {
          clearDuelTimer(data.duelId); // cancel the timeout timer
          finalizeRound(data.duelId, updatedState);
        }
      } catch (err) {
        socket.emit('error', {
          message: err instanceof Error ? err.message : 'Failed to submit answer.',
        });
      }
    });

    // ─── send_emote ───
    socket.on('send_emote', (data: { duelId: string; emote: string }) => {
      if (!data?.duelId || !data.emote) {
        socket.emit('error', { message: 'duelId and emote are required.' });
        return;
      }

      const state = storage.get(data.duelId);
      if (!state) {
        socket.emit('error', { message: 'Duel not found.' });
        return;
      }

      const updatedState = duelEngine.setEmote(state, userId, data.emote);
      storage.set(data.duelId, updatedState);

      // Broadcast emote to all players in the room
      io.to(data.duelId).emit('emote_received', {
        fromUserId: userId,
        fromUsername: username,
        emote: data.emote,
      });
    });

    // ─── get_duel_state ───
    socket.on('get_duel_state', (data: { duelId: string }) => {
      if (!data?.duelId) {
        socket.emit('error', { message: 'duelId is required.' });
        return;
      }
      const state = storage.get(data.duelId);
      if (!state) {
        socket.emit('error', { message: 'Duel not found.' });
        return;
      }
      socket.emit('duel_state', state);
    });

    // ─── disconnect ───
    socket.on('disconnect', () => {
      // Remove from matchmaking queue if waiting
      matchmakingQueue.removeFromQueue(userId);
      challengeManager.cancelChallenge(userId);

      // Handle in-progress duel disconnect
      const duelId = socketDuelMap.get(socket.id);
      if (duelId) {
        socketDuelMap.delete(socket.id);
        const members = duelRoomMembers.get(duelId);
        if (members) {
          members.delete(socket.id);
        }

        const state = storage.get(duelId);
        if (state && state.status !== 'duel_over') {
          // Forfeit: disconnected player loses
          const forfeitedState = duelEngine.handleDisconnect(state, userId);
          storage.set(duelId, forfeitedState);

          const winnerUsername =
            forfeitedState.winner !== null
              ? forfeitedState.players[forfeitedState.winner].username
              : null;

          io.to(duelId).emit('duel_over', {
            duelId,
            winner: forfeitedState.winner,
            winnerUsername,
            reason: 'opponent_disconnected',
            p1Score: forfeitedState.players[0].score,
            p2Score: forfeitedState.players[1].score,
            p1RoundsWon: forfeitedState.players[0].roundsWon,
            p2RoundsWon: forfeitedState.players[1].roundsWon,
          });

          broadcastState(duelId, forfeitedState);
          clearDuelTimer(duelId);
          clearDuelTimer(`${duelId}_countdown`);
        }
      }
    });
  });
}

// Export the in-memory storage class so the backend agent can use it
export { InMemoryDuelStorage };
export type { DuelStorage };
