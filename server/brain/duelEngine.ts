// ============================================================
// Balkan Duel — Duel State Machine / Engine
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { Question, pickBalancedQuestions } from './questions';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type DuelStatus = 'waiting' | 'countdown' | 'round_active' | 'round_over' | 'duel_over';

export interface AnswerRecord {
  questionId: string;
  answerIndex: number | null; // null = timed out
  correct: boolean;
  timeMs: number; // response time in milliseconds
  points: number;
}

export interface PlayerState {
  userId: number;
  username: string;
  score: number;
  roundsWon: number;
  answers: AnswerRecord[];
  currentEmote: string | null;
}

export interface RoundResult {
  round: number;
  winner: 0 | 1 | null; // player index or null = tie
  p1Points: number;
  p2Points: number;
}

export interface DuelState {
  duelId: string;
  status: DuelStatus;
  players: [PlayerState, PlayerState];
  currentRound: number; // 1-indexed
  totalRounds: number; // default 5
  questionPool: Question[]; // pre-selected questions for this duel
  currentQuestion: Question | null;
  roundStartTime: number | null; // Unix timestamp ms
  roundResults: RoundResult[];
  winner: 0 | 1 | null; // final winner index
  createdAt: number;
  updatedAt: number;
}

export interface ShareCardData {
  username: string;
  opponentUsername: string;
  won: boolean;
  finalScore: string; // e.g. "4-1"
  rounds: Array<'win' | 'loss' | 'tie'>; // coloured square sequence
  shareText: string;
}

export interface SubmitAnswerResult {
  state: DuelState;
  isCorrect: boolean;
  points: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const BASE_CORRECT_POINTS = 100;
const DEFAULT_TOTAL_ROUNDS = 5;

// Speed bonus thresholds (ms → bonus points)
const SPEED_BONUSES: Array<{ maxMs: number; bonus: number }> = [
  { maxMs: 1000, bonus: 50 },
  { maxMs: 2000, bonus: 30 },
  { maxMs: 3000, bonus: 15 },
  { maxMs: 4000, bonus: 5 },
];

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────

function now(): number {
  return Date.now();
}

function createPlayerState(userId: number, username: string): PlayerState {
  return {
    userId,
    username,
    score: 0,
    roundsWon: 0,
    answers: [],
    currentEmote: null,
  };
}

function calculateSpeedBonus(timeMs: number): number {
  for (const tier of SPEED_BONUSES) {
    if (timeMs <= tier.maxMs) return tier.bonus;
  }
  return 0;
}

function calculatePoints(correct: boolean, timeMs: number): number {
  if (!correct) return 0;
  return BASE_CORRECT_POINTS + calculateSpeedBonus(timeMs);
}

/**
 * Find the index (0 or 1) of the player with the given userId,
 * or -1 if not found.
 */
function findPlayerIndex(state: DuelState, userId: number): 0 | 1 | -1 {
  if (state.players[0].userId === userId) return 0;
  if (state.players[1].userId === userId) return 1;
  return -1;
}

// ─────────────────────────────────────────────
// DuelEngine class
// ─────────────────────────────────────────────

export class DuelEngine {
  /**
   * Create a new duel between two players.
   * Selects a balanced question pool upfront.
   */
  createDuel(
    player1Id: number,
    player1Username: string,
    player2Id: number,
    player2Username: string,
    totalRounds: number = DEFAULT_TOTAL_ROUNDS
  ): DuelState {
    const questionPool = pickBalancedQuestions(totalRounds);

    return {
      duelId: uuidv4(),
      status: 'waiting',
      players: [
        createPlayerState(player1Id, player1Username),
        createPlayerState(player2Id, player2Username),
      ],
      currentRound: 0,
      totalRounds,
      questionPool,
      currentQuestion: null,
      roundStartTime: null,
      roundResults: [],
      winner: null,
      createdAt: now(),
      updatedAt: now(),
    };
  }

  /**
   * Start the countdown phase (e.g., "3... 2... 1...").
   * Caller is responsible for then calling startRound() after the delay.
   */
  beginCountdown(duelState: DuelState): DuelState {
    if (duelState.status !== 'waiting' && duelState.status !== 'round_over') {
      throw new Error(`Cannot begin countdown from status: ${duelState.status}`);
    }

    return {
      ...duelState,
      status: 'countdown',
      updatedAt: now(),
    };
  }

  /**
   * Start the next round — pick the question for this round,
   * set status to round_active, record the start time.
   */
  startRound(duelState: DuelState): { state: DuelState; question: Question } {
    if (duelState.status !== 'countdown' && duelState.status !== 'waiting' && duelState.status !== 'round_over') {
      throw new Error(`Cannot start round from status: ${duelState.status}`);
    }
    if (this.checkDuelOver(duelState)) {
      throw new Error('Duel is already over — no more rounds.');
    }

    const nextRound = duelState.currentRound + 1;
    const questionIndex = nextRound - 1;
    const question = duelState.questionPool[questionIndex];

    if (!question) {
      throw new Error(`No question available for round ${nextRound}`);
    }

    const newState: DuelState = {
      ...duelState,
      status: 'round_active',
      currentRound: nextRound,
      currentQuestion: question,
      roundStartTime: now(),
      updatedAt: now(),
    };

    return { state: newState, question };
  }

  /**
   * Submit an answer from a player.
   * Calculates points based on correctness and speed.
   * A player can only answer once per round.
   */
  submitAnswer(
    duelState: DuelState,
    userId: number,
    answerIndex: number | null,
    timestampMs: number
  ): SubmitAnswerResult {
    if (duelState.status !== 'round_active') {
      throw new Error(`Cannot submit answer when status is: ${duelState.status}`);
    }
    if (!duelState.currentQuestion) {
      throw new Error('No active question for this round.');
    }

    const playerIndex = findPlayerIndex(duelState, userId);
    if (playerIndex === -1) {
      throw new Error(`User ${userId} is not a participant in duel ${duelState.duelId}`);
    }

    const player = duelState.players[playerIndex];
    const currentRound = duelState.currentRound;

    // Check if player already answered this round
    const alreadyAnswered = player.answers.some((a) => a.questionId === duelState.currentQuestion!.id);
    if (alreadyAnswered) {
      throw new Error(`Player ${userId} has already answered round ${currentRound}`);
    }

    const roundStart = duelState.roundStartTime ?? timestampMs;
    const timeMs = Math.max(0, timestampMs - roundStart);
    const isCorrect = answerIndex !== null && answerIndex === duelState.currentQuestion.correctIndex;
    const points = calculatePoints(isCorrect, timeMs);

    const answerRecord: AnswerRecord = {
      questionId: duelState.currentQuestion.id,
      answerIndex,
      correct: isCorrect,
      timeMs,
      points,
    };

    // Immutably update the player
    const updatedPlayer: PlayerState = {
      ...player,
      score: player.score + points,
      answers: [...player.answers, answerRecord],
    };

    const updatedPlayers: [PlayerState, PlayerState] = [...duelState.players] as [PlayerState, PlayerState];
    updatedPlayers[playerIndex] = updatedPlayer;

    const newState: DuelState = {
      ...duelState,
      players: updatedPlayers,
      updatedAt: now(),
    };

    return { state: newState, isCorrect, points };
  }

  /**
   * Handle a player timeout — treat as a null answer (0 points).
   */
  submitTimeout(duelState: DuelState, userId: number): SubmitAnswerResult {
    return this.submitAnswer(duelState, userId, null, now());
  }

  /**
   * Returns true if both players have answered the current round question (or timed out).
   */
  checkRoundComplete(duelState: DuelState): boolean {
    if (!duelState.currentQuestion) return false;
    const qId = duelState.currentQuestion.id;
    return duelState.players.every((p) => p.answers.some((a) => a.questionId === qId));
  }

  /**
   * Resolve the current round:
   * - Determine who won the round
   * - Update roundsWon
   * - Record RoundResult
   * - Set status to round_over
   */
  resolveRound(duelState: DuelState): DuelState {
    if (!duelState.currentQuestion) {
      throw new Error('No current question to resolve.');
    }

    const qId = duelState.currentQuestion.id;
    const p1Answer = duelState.players[0].answers.find((a) => a.questionId === qId);
    const p2Answer = duelState.players[1].answers.find((a) => a.questionId === qId);

    const p1Points = p1Answer?.points ?? 0;
    const p2Points = p2Answer?.points ?? 0;

    let roundWinner: 0 | 1 | null;
    if (p1Points > p2Points) roundWinner = 0;
    else if (p2Points > p1Points) roundWinner = 1;
    else roundWinner = null;

    const updatedPlayers: [PlayerState, PlayerState] = [
      {
        ...duelState.players[0],
        roundsWon: duelState.players[0].roundsWon + (roundWinner === 0 ? 1 : 0),
      },
      {
        ...duelState.players[1],
        roundsWon: duelState.players[1].roundsWon + (roundWinner === 1 ? 1 : 0),
      },
    ];

    const roundResult: RoundResult = {
      round: duelState.currentRound,
      winner: roundWinner,
      p1Points,
      p2Points,
    };

    return {
      ...duelState,
      status: 'round_over',
      players: updatedPlayers,
      roundResults: [...duelState.roundResults, roundResult],
      updatedAt: now(),
    };
  }

  /**
   * Returns true if all rounds have been played.
   */
  checkDuelOver(duelState: DuelState): boolean {
    return duelState.currentRound >= duelState.totalRounds && duelState.status === 'round_over';
  }

  /**
   * Resolve the duel:
   * - Determine the overall winner by rounds won (tiebreak: total score)
   * - Set status to duel_over
   */
  resolveDuel(duelState: DuelState): DuelState {
    if (!this.checkDuelOver(duelState)) {
      throw new Error('Duel is not yet complete.');
    }

    const p0 = duelState.players[0];
    const p1 = duelState.players[1];

    let winner: 0 | 1 | null;
    if (p0.roundsWon > p1.roundsWon) {
      winner = 0;
    } else if (p1.roundsWon > p0.roundsWon) {
      winner = 1;
    } else {
      // Tiebreak: total score
      if (p0.score > p1.score) winner = 0;
      else if (p1.score > p0.score) winner = 1;
      else winner = null; // perfect tie
    }

    return {
      ...duelState,
      status: 'duel_over',
      winner,
      updatedAt: now(),
    };
  }

  /**
   * Handle a player disconnect mid-duel.
   * The disconnected player forfeits — opponent wins.
   */
  handleDisconnect(duelState: DuelState, disconnectedUserId: number): DuelState {
    const playerIndex = findPlayerIndex(duelState, disconnectedUserId);
    if (playerIndex === -1) return duelState;

    const winner: 0 | 1 = playerIndex === 0 ? 1 : 0;

    return {
      ...duelState,
      status: 'duel_over',
      winner,
      updatedAt: now(),
    };
  }

  /**
   * Set a player's current emote (cleared on next round start).
   */
  setEmote(duelState: DuelState, userId: number, emote: string): DuelState {
    const playerIndex = findPlayerIndex(duelState, userId);
    if (playerIndex === -1) return duelState;

    const updatedPlayers: [PlayerState, PlayerState] = [...duelState.players] as [PlayerState, PlayerState];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      currentEmote: emote,
    };

    return {
      ...duelState,
      players: updatedPlayers,
      updatedAt: now(),
    };
  }

  /**
   * Clear all emotes (call at round start).
   */
  clearEmotes(duelState: DuelState): DuelState {
    const updatedPlayers: [PlayerState, PlayerState] = [
      { ...duelState.players[0], currentEmote: null },
      { ...duelState.players[1], currentEmote: null },
    ];
    return {
      ...duelState,
      players: updatedPlayers,
      updatedAt: now(),
    };
  }

  /**
   * Generate a Wordle-style share card for a specific player.
   */
  generateShareCard(duelState: DuelState, userId: number): ShareCardData {
    const playerIndex = findPlayerIndex(duelState, userId);
    if (playerIndex === -1) {
      throw new Error(`User ${userId} not found in duel ${duelState.duelId}`);
    }

    const opponentIndex: 0 | 1 = playerIndex === 0 ? 1 : 0;
    const player = duelState.players[playerIndex];
    const opponent = duelState.players[opponentIndex];

    const rounds: Array<'win' | 'loss' | 'tie'> = duelState.roundResults.map((result) => {
      if (result.winner === null) return 'tie';
      if (result.winner === playerIndex) return 'win';
      return 'loss';
    });

    const won = duelState.winner === playerIndex;

    // From the player's perspective: rounds won by player vs opponent
    const playerRoundsWon = player.roundsWon;
    const opponentRoundsWon = opponent.roundsWon;
    const finalScore = `${playerRoundsWon}-${opponentRoundsWon}`;

    // Colour squares: 🟩 win, 🟥 loss, 🟨 tie
    const squares = rounds
      .map((r) => (r === 'win' ? '🟩' : r === 'loss' ? '🟥' : '🟨'))
      .join('');

    const resultWord = won ? 'beat' : duelState.winner === null ? 'tied with' : 'lost to';
    const trophyOrSword = won ? '🏆' : '⚔️';

    const shareText =
      `I ${resultWord} @${opponent.username} in Balkan Duel! ${trophyOrSword} SCORE: ${finalScore}\n` +
      `${squares}\n` +
      `Play at balkanduel.gg`;

    return {
      username: player.username,
      opponentUsername: opponent.username,
      won,
      finalScore,
      rounds,
      shareText,
    };
  }

  /**
   * Get round-by-round stats for a player (useful for end screen).
   */
  getPlayerRoundStats(
    duelState: DuelState,
    userId: number
  ): Array<{ round: number; points: number; correct: boolean; timeMs: number }> {
    const playerIndex = findPlayerIndex(duelState, userId);
    if (playerIndex === -1) return [];

    const player = duelState.players[playerIndex];
    return duelState.questionPool.map((q, i) => {
      const answer = player.answers.find((a) => a.questionId === q.id);
      return {
        round: i + 1,
        points: answer?.points ?? 0,
        correct: answer?.correct ?? false,
        timeMs: answer?.timeMs ?? 0,
      };
    });
  }
}

// Export a singleton instance for convenience
export const duelEngine = new DuelEngine();
