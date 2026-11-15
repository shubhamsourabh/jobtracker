import express from "express";

const PORT = 5000;

const app = express();

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
});
