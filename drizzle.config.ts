import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: './shared/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: './balkanduel.db',
  },
});
