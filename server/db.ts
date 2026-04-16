// Database connection is now managed directly in server/storage.ts
// which switches between SQLite (local) and Postgres (production/Supabase)
// based on the DATABASE_URL environment variable.
//
// This file is kept for reference but is no longer imported.
export {};
