import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import passport from "./auth.js";
import { prisma } from "./prisma.js";

import authRoutes from "./routes/auth.js";
import sceneRoutes from "./routes/scenes.js";
import gameRoutes from "./routes/game.js";
import scoreRoutes from "./routes/scores.js";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------- middleware ---------- */
app.use(morgan("dev"));
app.use(express.json());

// CORS: handle undefined origins gracefully (e.g., curl, Postman)
const allowList = [process.env.CLIENT_ORIGIN, process.env.ORIGIN].filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);                // non-browser clients
      if (allowList.length === 0 || allowList.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for ${origin}`));
    },
    credentials: true,
  })
);

app.use(passport.initialize());

app.use("/static", express.static(path.join(__dirname, "../public/static")));
app.use("/icons",  express.static(path.join(__dirname, "../public/icons")));

/* ---------- health check ---------- */
app.get("/api/health", async (_req, res) => {
  const t0 = Date.now();
  try {
    // ping DB (Postgres)
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      db: true,
      uptime: process.uptime(),
      ms: Date.now() - t0,
    });
  } catch (e) {
    console.error("Health DB check failed:", e);
    res.status(500).json({ ok: false, db: false, error: "DB unreachable" });
  }
});

/* ---------- routes ---------- */
app.use("/api/auth",   authRoutes);
app.use("/api/scenes", sceneRoutes);
app.use("/api/game",   gameRoutes);
app.use("/api/scores", scoreRoutes);

/* ---------- 404 & error handler ---------- */
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

/* ---------- start ---------- */
const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT}`);
});
