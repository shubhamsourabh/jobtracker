import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import applicationRouter from "./routes/application.js";
import cookieParser from "cookie-parser";
import errorHandler  from "./middleware/errorHandler.js";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cookieParser())

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/slow",async (req, res) => {
  const end = Date.now() + 10000;
  await new Promise((resolve) => setTimeout(resolve, 10000))     
  res.send("done");
});

app.use("/api/auth", authRouter);
app.use("/api/applications", applicationRouter);
app.use(errorHandler);
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