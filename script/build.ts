import { build as esbuild, type Plugin } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "postgres",
  "stripe",
  "uuid",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  // Force native-only modules to always be external (never bundled)
  // These modules use native Node.js bindings that won't work on Vercel serverless
  const nativeExternal = ['better-sqlite3', 'drizzle-orm/better-sqlite3', './storage-sqlite', './storage-sqlite.js'];

  // Stub plugin: replace better-sqlite3 with an empty module at build time
  // so it doesn't get bundled at all
  const stubNativePlugin: Plugin = {
    name: 'stub-native',
    setup(build) {
      // Make better-sqlite3 return a stub when required in production bundle
      build.onResolve({ filter: /^better-sqlite3$/ }, () => ({
        path: 'better-sqlite3',
        external: true,
      }));
      build.onResolve({ filter: /storage-sqlite/ }, () => ({
        path: './storage-sqlite',
        external: true,
      }));
    },
  };

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: [...externals, ...nativeExternal],
    plugins: [stubNativePlugin],
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
