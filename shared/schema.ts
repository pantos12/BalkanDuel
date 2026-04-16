import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// USERS table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  bestStreak: integer('best_streak').notNull().default(0),
  totalPoints: integer('total_points').notNull().default(0),
  createdAt: integer('created_at').notNull(),
});

// DUELS table
export const duels = sqliteTable('duels', {
  id: text('id').primaryKey(), // UUID
  player1Id: integer('player1_id').notNull().references(() => users.id),
  player2Id: integer('player2_id').references(() => users.id), // null if waiting
  status: text('status').notNull().default('waiting'), // waiting|active|completed
  winnerId: integer('winner_id').references(() => users.id),
  player1Score: integer('player1_score').notNull().default(0),
  player2Score: integer('player2_score').notNull().default(0),
  roundsData: text('rounds_data').notNull().default('[]'), // JSON
  shareCardData: text('share_card_data'), // JSON
  createdAt: integer('created_at').notNull(),
  completedAt: integer('completed_at'),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  wins: true,
  losses: true,
  currentStreak: true,
  bestStreak: true,
  totalPoints: true,
  createdAt: true,
});

export const insertDuelSchema = createInsertSchema(duels).omit({
  id: true,
  player2Id: true,
  winnerId: true,
  player1Score: true,
  player2Score: true,
  roundsData: true,
  shareCardData: true,
  completedAt: true,
});

// Auth validation schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDuel = z.infer<typeof insertDuelSchema>;
export type Duel = typeof duels.$inferSelect;
