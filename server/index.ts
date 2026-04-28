import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Log every incoming request before any other middleware runs so we can
// confirm requests are reaching the app and identify where crashes occur.
app.use((req, _res, next) => {
  console.log(`[request] ${req.method} ${req.url} — headers: ${JSON.stringify(req.headers)}`);
  next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  process.exit(1);
});

(async () => {
  try {
    await registerRoutes(httpServer, app);

    // Wrap subsequent middleware so that synchronous throws are caught and
    // forwarded to the Express error handler instead of crashing the process.
    app.use((req: Request, res: Response, next: NextFunction) => {
      try {
        next();
      } catch (err) {
        next(err);
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      try {
        serveStatic(app);
      } catch (err) {
        console.error("Failed to initialise static file serving:", err);
        process.exit(1);
      }
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // Catch-all 404 handler — logs any request that fell through all routes.
    app.use((req: Request, res: Response) => {
      console.log(`[404] No route matched: ${req.method} ${req.url}`);
      res.status(404).json({ message: "Not Found" });
    });

    // Error handler must be registered last so it catches errors from all
    // middleware registered above, including the static file serving layer.
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error(`[error] ${req.method} ${req.url} — status ${status}:`, err);

      if (res.headersSent) {
        return next(err);
      }

      return res.status(status).json({ message });
    });

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || "8080", 10);
    const host = process.env.HOST || "0.0.0.0";
    httpServer.listen(port, host, () => {
      log(`serving on port ${port}`);
      console.log(`[startup] HTTP server listening on ${host}:${port} (NODE_ENV=${process.env.NODE_ENV})`);
    });
  } catch (err) {
    console.error("Fatal error during server initialization:", err);
    process.exit(1);
  }
})();
