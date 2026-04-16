import { db } from './db';
import { users, duels, type User, type Duel } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

export interface IStorage {
  // Users
  createUser(data: { username: string; passwordHash: string }): User;
  getUserById(id: number): User | undefined;
  getUserByUsername(username: string): User | undefined;
  updateUserStats(id: number, won: boolean, pointsEarned: number): void;
  getLeaderboard(limit?: number): User[];

  // Duels
  createDuel(id: string, player1Id: number): Duel;
  getDuelById(id: string): Duel | undefined;
  updateDuel(id: string, updates: Partial<Duel>): Duel | undefined;
  getRecentDuels(limit?: number): Duel[];
  getUserDuels(userId: number): Duel[];

  // Stats
  getTotalDuels(): number;
  getActiveDuels(): number;
  getTotalPlayers(): number;
}

export class DatabaseStorage implements IStorage {
  // ─── Users ───────────────────────────────────────────────────────────────

  createUser(data: { username: string; passwordHash: string }): User {
    return db.insert(users).values({
      username: data.username,
      passwordHash: data.passwordHash,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPoints: 0,
      createdAt: Date.now(),
    }).returning().get()!;
  }

  getUserById(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getUserByUsername(username: string): User | undefined {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  updateUserStats(id: number, won: boolean, pointsEarned: number): void {
    const user = this.getUserById(id);
    if (!user) return;
    const newStreak = won ? user.currentStreak + 1 : 0;
    db.update(users).set({
      wins: won ? user.wins + 1 : user.wins,
      losses: won ? user.losses : user.losses + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(user.bestStreak, newStreak),
      totalPoints: user.totalPoints + pointsEarned,
    }).where(eq(users.id, id)).run();
  }

  getLeaderboard(limit = 100): User[] {
    return db.select().from(users)
      .orderBy(desc(users.wins))
      .limit(limit)
      .all();
  }

  // ─── Duels ───────────────────────────────────────────────────────────────

  createDuel(id: string, player1Id: number): Duel {
    return db.insert(duels).values({
      id,
      player1Id,
      status: 'waiting',
      player1Score: 0,
      player2Score: 0,
      roundsData: '[]',
      createdAt: Date.now(),
    }).returning().get()!;
  }

  getDuelById(id: string): Duel | undefined {
    return db.select().from(duels).where(eq(duels.id, id)).get();
  }

  updateDuel(id: string, updates: Partial<Duel>): Duel | undefined {
    db.update(duels).set(updates).where(eq(duels.id, id)).run();
    return this.getDuelById(id);
  }

  getRecentDuels(limit = 20): Duel[] {
    return db.select().from(duels)
      .where(eq(duels.status, 'completed'))
      .orderBy(desc(duels.completedAt))
      .limit(limit)
      .all();
  }

  getUserDuels(userId: number): Duel[] {
    return db.select().from(duels)
      .where(
        sql`${duels.player1Id} = ${userId} OR ${duels.player2Id} = ${userId}`
      )
      .orderBy(desc(duels.createdAt))
      .limit(20)
      .all();
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  getTotalDuels(): number {
    const result = db.select({ count: sql<number>`count(*)` }).from(duels).get();
    return result?.count ?? 0;
  }

  getActiveDuels(): number {
    const result = db.select({ count: sql<number>`count(*)` })
      .from(duels)
      .where(eq(duels.status, 'active'))
      .get();
    return result?.count ?? 0;
  }

  getTotalPlayers(): number {
    const result = db.select({ count: sql<number>`count(*)` }).from(users).get();
    return result?.count ?? 0;
  }
}

export const storage = new DatabaseStorage();
