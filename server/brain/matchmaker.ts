// ============================================================
// Balkan Duel — In-Memory Matchmaking Queue
// ============================================================

export interface QueueEntry {
  userId: number;
  username: string;
  joinedAt: number; // Unix timestamp ms
}

export interface MatchResult {
  player1: QueueEntry;
  player2: QueueEntry;
}

export class Queue {
  private readonly queue: Map<number, QueueEntry> = new Map();

  // ─────────────────────────────────────────────
  // Core queue operations
  // ─────────────────────────────────────────────

  /**
   * Add a player to the matchmaking queue.
   * If the player is already in the queue, their entry is refreshed.
   */
  addToQueue(userId: number, username: string): void {
    this.queue.set(userId, {
      userId,
      username,
      joinedAt: Date.now(),
    });
  }

  /**
   * Remove a player from the queue (e.g., they left the lobby or were matched).
   */
  removeFromQueue(userId: number): void {
    this.queue.delete(userId);
  }

  /**
   * Attempt to match two players from the queue (FIFO order).
   * Returns the matched pair or null if fewer than 2 players are waiting.
   */
  tryMatch(): MatchResult | null {
    if (this.queue.size < 2) return null;

    // Get entries sorted by join time (oldest first)
    const entries = Array.from(this.queue.values()).sort((a, b) => a.joinedAt - b.joinedAt);

    const player1 = entries[0];
    const player2 = entries[1];

    // Remove both from queue
    this.queue.delete(player1.userId);
    this.queue.delete(player2.userId);

    return { player1, player2 };
  }

  /**
   * Returns the current number of players waiting in the queue.
   */
  getQueueSize(): number {
    return this.queue.size;
  }

  /**
   * Returns true if the given user is currently in the queue.
   */
  isInQueue(userId: number): boolean {
    return this.queue.has(userId);
  }

  /**
   * Returns a snapshot of the current queue entries, sorted by join time.
   * Useful for monitoring/admin endpoints.
   */
  getQueueSnapshot(): QueueEntry[] {
    return Array.from(this.queue.values()).sort((a, b) => a.joinedAt - b.joinedAt);
  }

  /**
   * Clear the entire queue (use for testing or server shutdown).
   */
  clear(): void {
    this.queue.clear();
  }
}

// ─────────────────────────────────────────────
// Direct Challenge system
// ─────────────────────────────────────────────

export interface ChallengeEntry {
  challengerId: number;
  challengerUsername: string;
  targetUsername: string;
  createdAt: number;
  expiresAt: number;
}

const CHALLENGE_EXPIRY_MS = 30_000; // 30 seconds to accept

export class ChallengeManager {
  // Map of target username (lowercase) → pending challenge
  private readonly challenges: Map<string, ChallengeEntry> = new Map();

  /**
   * Issue a challenge from one player to another (by username).
   * Overwrites any existing challenge to the same target.
   */
  issueChallenge(challengerId: number, challengerUsername: string, targetUsername: string): ChallengeEntry {
    const entry: ChallengeEntry = {
      challengerId,
      challengerUsername,
      targetUsername: targetUsername.toLowerCase(),
      createdAt: Date.now(),
      expiresAt: Date.now() + CHALLENGE_EXPIRY_MS,
    };
    this.challenges.set(targetUsername.toLowerCase(), entry);
    return entry;
  }

  /**
   * Check if there is a pending, non-expired challenge for a target username.
   * Returns the challenge entry or null.
   */
  getPendingChallenge(targetUsername: string): ChallengeEntry | null {
    const entry = this.challenges.get(targetUsername.toLowerCase());
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.challenges.delete(targetUsername.toLowerCase());
      return null;
    }
    return entry;
  }

  /**
   * Accept a challenge for the given target username.
   * Returns the challenge entry and removes it from the pending list.
   */
  acceptChallenge(targetUsername: string): ChallengeEntry | null {
    const entry = this.getPendingChallenge(targetUsername);
    if (entry) {
      this.challenges.delete(targetUsername.toLowerCase());
    }
    return entry;
  }

  /**
   * Cancel a challenge issued by a specific challenger.
   */
  cancelChallenge(challengerId: number): void {
    const entries = Array.from(this.challenges.entries());
    for (const [key, entry] of entries) {
      if (entry.challengerId === challengerId) {
        this.challenges.delete(key);
        break;
      }
    }
  }

  /**
   * Remove all expired challenges (call periodically for cleanup).
   */
  pruneExpired(): void {
    const now = Date.now();
    const allEntries = Array.from(this.challenges.entries());
    for (const [key, entry] of allEntries) {
      if (now > entry.expiresAt) {
        this.challenges.delete(key);
      }
    }
  }
}

// Export singletons for use across the application
export const matchmakingQueue = new Queue();
export const challengeManager = new ChallengeManager();
