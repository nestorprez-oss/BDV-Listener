import "dotenv/config";
import express from "express";
import cors from "cors";
import webhookRouter from "./routes/webhook.js";
import searchRouter from "./routes/search.js";
import paymentsRouter from "./routes/payments.js";
import tasaRouter from "./routes/tasa.js";

const app = express();
const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.API_TOKEN || "";

const USERS = {
  admin:    { password: "Lucas1812*", role: "admin" },
  operador: { password: "Op3raD0r*25", role: "operador" },
};

app.use(cors());
app.use(express.json());

function apiTokenAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (API_TOKEN && token !== API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized: invalid API token" });
  }
  next();
}

function frontendAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Basic ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");

  const user = USERS[username];
  if (!user || password !== user.password) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = { username, role: user.role };
  next();
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/webhook", apiTokenAuth, webhookRouter);
app.use("/api/search", frontendAuth, searchRouter);
app.use("/api/payments", frontendAuth, adminOnly, paymentsRouter);
app.use("/api/tasa", frontendAuth, adminOnly, tasaRouter);

app.listen(PORT, () => {
  console.log(`BDV Monitor backend running on port ${PORT}`);
  console.log(`Webhook: POST http://localhost:${PORT}/api/webhook (Bearer token)`);
  console.log(`Search:  GET  http://localhost:${PORT}/api/search?monto=X&ref=Y (Basic auth)`);
});
