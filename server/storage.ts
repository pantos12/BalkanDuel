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

// ─── Postgres Storage (Supabase production) ──────────────────────────────────

export class PostgresStorage implements IStorage {
  private sql: any;
  private connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
    // Lazy — do NOT connect here. Connection opens on first query.
  }

  private getSql() {
    if (!this.sql) {
      const pg = require('postgres');
      this.sql = pg(this.connectionString, {
        ssl: 'require',
        max: 10,
        idle_timeout: 20,
        connect_timeout: 30,
        // Required for Supabase transaction pooler (port 6543)
        prepare: false,
      });
    }
    return this.sql;
  }

  async init(): Promise<void> {
    await this.getSql()`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        wins INTEGER NOT NULL DEFAULT 0,
        losses INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        best_streak INTEGER NOT NULL DEFAULT 0,
        total_points INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL
      )
    `;
    await this.getSql()`
      CREATE TABLE IF NOT EXISTS duels (
        id TEXT PRIMARY KEY,
        player1_id INTEGER NOT NULL REFERENCES users(id),
        player2_id INTEGER REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'waiting',
        winner_id INTEGER REFERENCES users(id),
        player1_score INTEGER NOT NULL DEFAULT 0,
        player2_score INTEGER NOT NULL DEFAULT 0,
        rounds_data TEXT NOT NULL DEFAULT '[]',
        share_card_data TEXT,
        created_at BIGINT NOT NULL,
        completed_at BIGINT
      )
    `;
  }

  async createUser(data: { username: string; passwordHash: string }): Promise<User> {
    const [user] = await this.getSql()`
      INSERT INTO users (username, password_hash, wins, losses, current_streak, best_streak, total_points, created_at)
      VALUES (${data.username}, ${data.passwordHash}, 0, 0, 0, 0, 0, ${Date.now()})
      RETURNING *
    `;
    return this.mapUser(user);
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await this.getSql()`SELECT * FROM users WHERE id = ${id}`;
    return user ? this.mapUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.getSql()`SELECT * FROM users WHERE username = ${username}`;
    return user ? this.mapUser(user) : undefined;
  }

  async updateUserStats(id: number, won: boolean, pointsEarned: number): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) return;
    const newStreak = won ? user.currentStreak + 1 : 0;
    await this.getSql()`
      UPDATE users SET
        wins = wins + ${won ? 1 : 0},
        losses = losses + ${won ? 0 : 1},
        current_streak = ${newStreak},
        best_streak = GREATEST(best_streak, ${newStreak}),
        total_points = total_points + ${pointsEarned}
      WHERE id = ${id}
    `;
  }

  async getLeaderboard(limit = 100): Promise<User[]> {
    const rows = await this.getSql()`SELECT * FROM users ORDER BY wins DESC LIMIT ${limit}`;
    return rows.map((r: any) => this.mapUser(r));
  }

  async createDuel(id: string, player1Id: number): Promise<Duel> {
    const [duel] = await this.getSql()`
      INSERT INTO duels (id, player1_id, status, player1_score, player2_score, rounds_data, created_at)
      VALUES (${id}, ${player1Id}, 'waiting', 0, 0, '[]', ${Date.now()})
      RETURNING *
    `;
    return this.mapDuel(duel);
  }

  async getDuelById(id: string): Promise<Duel | undefined> {
    const [duel] = await this.getSql()`SELECT * FROM duels WHERE id = ${id}`;
    return duel ? this.mapDuel(duel) : undefined;
  }

  async updateDuel(id: string, updates: Partial<Duel>): Promise<Duel | undefined> {
    if (updates.player2Id !== undefined) {
      await this.getSql()`UPDATE duels SET player2_id = ${updates.player2Id} WHERE id = ${id}`;
    }
    if (updates.status !== undefined) {
      await this.getSql()`UPDATE duels SET status = ${updates.status} WHERE id = ${id}`;
    }
    if (updates.winnerId !== undefined) {
      await this.getSql()`UPDATE duels SET winner_id = ${updates.winnerId} WHERE id = ${id}`;
    }
    if (updates.player1Score !== undefined) {
      await this.getSql()`UPDATE duels SET player1_score = ${updates.player1Score} WHERE id = ${id}`;
    }
    if (updates.player2Score !== undefined) {
      await this.getSql()`UPDATE duels SET player2_score = ${updates.player2Score} WHERE id = ${id}`;
    }
    if (updates.roundsData !== undefined) {
      await this.getSql()`UPDATE duels SET rounds_data = ${updates.roundsData} WHERE id = ${id}`;
    }
    if (updates.shareCardData !== undefined) {
      await this.getSql()`UPDATE duels SET share_card_data = ${updates.shareCardData} WHERE id = ${id}`;
    }
    if (updates.completedAt !== undefined) {
      await this.getSql()`UPDATE duels SET completed_at = ${updates.completedAt} WHERE id = ${id}`;
    }
    return this.getDuelById(id);
  }

  async getRecentDuels(limit = 20): Promise<Duel[]> {
    const rows = await this.getSql()`SELECT * FROM duels WHERE status = 'completed' ORDER BY completed_at DESC LIMIT ${limit}`;
    return rows.map((r: any) => this.mapDuel(r));
  }

  async getUserDuels(userId: number): Promise<Duel[]> {
    const rows = await this.getSql()`SELECT * FROM duels WHERE player1_id = ${userId} OR player2_id = ${userId} ORDER BY created_at DESC LIMIT 20`;
    return rows.map((r: any) => this.mapDuel(r));
  }

  async getTotalDuels(): Promise<number> {
    const [r] = await this.getSql()`SELECT COUNT(*) as count FROM duels`;
    return Number(r.count);
  }

  async getActiveDuels(): Promise<number> {
    const [r] = await this.getSql()`SELECT COUNT(*) as count FROM duels WHERE status = 'active'`;
    return Number(r.count);
  }

  async getTotalPlayers(): Promise<number> {
    const [r] = await this.getSql()`SELECT COUNT(*) as count FROM users`;
    return Number(r.count);
  }

  private mapUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      wins: row.wins,
      losses: row.losses,
      currentStreak: row.current_streak,
      bestStreak: row.best_streak,
      totalPoints: row.total_points,
      createdAt: Number(row.created_at),
    };
  }

  private mapDuel(row: any): Duel {
    return {
      id: row.id,
      player1Id: row.player1_id,
      player2Id: row.player2_id ?? null,
      status: row.status,
      winnerId: row.winner_id ?? null,
      player1Score: row.player1_score,
      player2Score: row.player2_score,
      roundsData: row.rounds_data,
      shareCardData: row.share_card_data ?? null,
      createdAt: Number(row.created_at),
      completedAt: row.completed_at ? Number(row.completed_at) : null,
    };
  }
}

// ─── Export the correct storage based on environment ──────────────────────────
// IMPORTANT: DatabaseStorage (SQLite) must only be instantiated when DATABASE_URL
// is NOT set. On Vercel/serverless, better-sqlite3 native bindings are not
// available, so we must never call `new DatabaseStorage()` in production.

function createStorage(): IStorage {
  if (process.env.DATABASE_URL) {
    return new PostgresStorage(process.env.DATABASE_URL);
  }
  // Only import SQLite in non-production environments
  // Use dynamic require so esbuild does NOT statically bundle better-sqlite3
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL must be set in production. SQLite is only for local development.');
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { DatabaseStorage } = require('./storage-sqlite');
  return new DatabaseStorage();
}

export const storage: IStorage = createStorage();
