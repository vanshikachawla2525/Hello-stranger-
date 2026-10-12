// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function createServer() {
  const app = express();
  const defaultPort = Number(process.env.PORT) || 3e3;
  const distDir = path.resolve(__dirname, "dist");
  const distExists = fs.existsSync(distDir) && fs.existsSync(path.join(distDir, "index.html"));
  app.use(express.json());
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });
  app.get("/_health", (_req, res) => {
    res.status(200).send("OK");
  });
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  if (distExists) {
    app.use(
      express.static(distDir, {
        maxAge: "1h",
        etag: true,
        index: false
      })
    );
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  } else {
    console.log("Production build not found in dist/. Mounting Vite middleware in development mode...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.use((err, _req, res, _next) => {
    console.error("Unhandled server error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err && typeof err === "object" && "message" in err ? String(err.message) : "Unknown server error"
    });
  });
  function listenOnPort(p) {
    return new Promise((resolve, reject) => {
      const s = app.listen(p, "0.0.0.0", () => {
        console.log(`Server is running at http://0.0.0.0:${p}`);
        resolve(s);
      });
      s.once("error", (err) => {
        if (err && err.code === "EADDRINUSE" && p !== 3e3) {
          console.warn(`Port ${p} in use. Falling back to port 3000...`);
          listenOnPort(3e3).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
  }
  const server = await listenOnPort(defaultPort);
  const shutdown = () => {
    console.log("Shutting down server gracefully...");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  return server;
}
createServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
