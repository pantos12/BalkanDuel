// ============================================================
// Balkan Duel Brain — Main Entry Point
// Re-exports all public modules for use by the backend agent.
// ============================================================

// ─── Question Bank ───────────────────────────────────────────
export type { Question, Category } from './questions';
export {
  questions,
  CATEGORIES,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  pickRandomQuestions,
  pickBalancedQuestions,
} from './questions';

// ─── Duel Engine ─────────────────────────────────────────────
export type {
  DuelStatus,
  AnswerRecord,
  PlayerState,
  RoundResult,
  DuelState,
  ShareCardData,
  SubmitAnswerResult,
} from './duelEngine';
export { DuelEngine, duelEngine } from './duelEngine';

// ─── Matchmaking ─────────────────────────────────────────────
export type { QueueEntry, MatchResult, ChallengeEntry } from './matchmaker';
export {
  Queue,
  ChallengeManager,
  matchmakingQueue,
  challengeManager,
} from './matchmaker';

// ─── Game Rooms (Socket.io) ───────────────────────────────────
export type { DuelStorage } from './gameRooms';
export { setupGameRooms, InMemoryDuelStorage } from './gameRooms';
