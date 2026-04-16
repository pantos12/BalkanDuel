// Vercel serverless entry point
// This exports the Express app as a handler instead of calling listen()
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes (async, so we use a promise)
let initialized = false;
let initPromise: Promise<void> | null = null;

async function initialize() {
  if (initialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    await registerRoutes(httpServer, app);
    
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });
    
    serveStatic(app);
    initialized = true;
  })();
  
  return initPromise;
}

// Export handler for Vercel
export default async function handler(req: Request, res: Response) {
  await initialize();
  app(req, res);
}

// Also start the server for local dev / non-Vercel deployments
if (process.env.VERCEL !== '1') {
  (async () => {
    await initialize();
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen({ port, host: "0.0.0.0" }, () => {
      console.log(`serving on port ${port}`);
    });
  })();
}
