// Vercel serverless handler
// Vercel detects this as an API function and invokes it for all requests.
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function getApp() {
  if (!initialized) {
    try {
      await registerRoutes(httpServer, app);
    } catch (e) {
      console.error("Route init error:", e);
    }
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      if (!res.headersSent) {
        res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
      }
    });
    serveStatic(app);
    initialized = true;
  }
  return app;
}

export default async function handler(req: Request, res: Response) {
  const a = await getApp();
  return a(req, res);
}
