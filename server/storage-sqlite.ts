import { type User, type Duel } from '@shared/schema';

// ─── Async Storage Interface ─────────────────────────────────────────────────
// All methods are async to support both sync SQLite and async Postgres.

export interface IStorage {
  // Users
  createUser(data: { username: string; passwordHash: string }): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserStats(id: number, won: boolean, pointsEarned: number): Promise<void>;
  getLeaderboard(limit?: number): Promise<User[]>;

  // Duels
  createDuel(id: string, player1Id: number): Promise<Duel>;
  getDuelById(id: string): Promise<Duel | undefined>;
  updateDuel(id: string, updates: Partial<Duel>): Promise<Duel | undefined>;
  getRecentDuels(limit?: number): Promise<Duel[]>;
  getUserDuels(userId: number): Promise<Duel[]>;

  // Stats
  getTotalDuels(): Promise<number>;
  getActiveDuels(): Promise<number>;
  getTotalPlayers(): Promise<number>;

  // Init (create tables if needed)
  init(): Promise<void>;
}

// ─── SQLite Storage (local dev only) ─────────────────────────────────────────
// Uses better-sqlite3 + drizzle-orm/better-sqlite3 for synchronous local dev.

export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    // These imports are safe locally — better-sqlite3 is installed for dev
    const Database = require('better-sqlite3');
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    const path = require('path');
    const schema = require('../shared/schema');

    const sqlite = new Database(path.join(process.cwd(), 'balkanduel.db'));
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    this.db = drizzle(sqlite, { schema });
  }

  async init(): Promise<void> {
    // SQLite tables are created via drizzle-kit push — nothing needed here
  }

  async createUser(data: { username: string; passwordHash: string }): Promise<User> {
    const { users } = require('../shared/schema');
    return this.db.insert(users).values({
      username: data.username,
      passwordHash: data.passwordHash,
      wins: 0, losses: 0, currentStreak: 0, bestStreak: 0, totalPoints: 0,
      createdAt: Date.now(),
    }).returning().get()!;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const { users } = require('../shared/schema');
    const { eq } = require('drizzle-orm');
    return this.db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { users } = require('../shared/schema');
    const { eq } = require('drizzle-orm');
    return this.db.select().from(users).where(eq(users.username, username)).get();
  }

  async updateUserStats(id: number, won: boolean, pointsEarned: number): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) return;
    const { users } = require('../shared/schema');
    const { eq } = require('drizzle-orm');
    const newStreak = won ? user.currentStreak + 1 : 0;
    this.db.update(users).set({
      wins: won ? user.wins + 1 : user.wins,
      losses: won ? user.losses : user.losses + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(user.bestStreak, newStreak),
      totalPoints: user.totalPoints + pointsEarned,
    }).where(eq(users.id, id)).run();
  }

  async getLeaderboard(limit = 100): Promise<User[]> {
    const { users } = require('../shared/schema');
    const { desc } = require('drizzle-orm');
    return this.db.select().from(users).orderBy(desc(users.wins)).limit(limit).all();
  }

  async createDuel(id: string, player1Id: number): Promise<Duel> {
    const { duels } = require('../shared/schema');
    return this.db.insert(duels).values({
      id, player1Id, status: 'waiting',
      player1Score: 0, player2Score: 0, roundsData: '[]',
      createdAt: Date.now(),
    }).returning().get()!;
  }

  async getDuelById(id: string): Promise<Duel | undefined> {
    const { duels } = require('../shared/schema');
    const { eq } = require('drizzle-orm');
    return this.db.select().from(duels).where(eq(duels.id, id)).get();
  }

  async updateDuel(id: string, updates: Partial<Duel>): Promise<Duel | undefined> {
    const { duels } = require('../shared/schema');
    const { eq } = require('drizzle-orm');
    this.db.update(duels).set(updates).where(eq(duels.id, id)).run();
    return this.getDuelById(id);
  }

  async getRecentDuels(limit = 20): Promise<Duel[]> {
    const { duels } = require('../shared/schema');
    const { eq, desc } = require('drizzle-orm');
    return this.db.select().from(duels)
      .where(eq(duels.status, 'completed'))
      .orderBy(desc(duels.completedAt))
      .limit(limit).all();
  }

  async getUserDuels(userId: number): Promise<Duel[]> {
    const { duels } = require('../shared/schema');
    const { desc, sql } = require('drizzle-orm');
    return this.db.select().from(duels)
      .where(sql`${duels.player1Id} = ${userId} OR ${duels.player2Id} = ${userId}`)
      .orderBy(desc(duels.createdAt))
      .limit(20).all();
  }

  async getTotalDuels(): Promise<number> {
    const { duels } = require('../shared/schema');
    const { sql } = require('drizzle-orm');
    const result = this.db.select({ count: sql<number>`count(*)` }).from(duels).get();
    return result?.count ?? 0;
  }

  async getActiveDuels(): Promise<number> {
    const { duels } = require('../shared/schema');
    const { eq, sql } = require('drizzle-orm');
    const result = this.db.select({ count: sql<number>`count(*)` })
      .from(duels).where(eq(duels.status, 'active')).get();
    return result?.count ?? 0;
  }

  async getTotalPlayers(): Promise<number> {
    const { users } = require('../shared/schema');
    const { sql } = require('drizzle-orm');
    const result = this.db.select({ count: sql<number>`count(*)` }).from(users).get();
    return result?.count ?? 0;
  }
}

