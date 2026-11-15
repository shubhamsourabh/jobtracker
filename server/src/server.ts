import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});