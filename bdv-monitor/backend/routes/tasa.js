import { Router } from "express";

const router = Router();

const TASA_API_URL = "https://blocco.restaurant/api/tasa";

router.get("/", async (_req, res) => {
  try {
    const response = await fetch(TASA_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("tasa proxy error:", err.message);
    res.status(502).json({ error: "No se pudo obtener la tasa" });
  }
});

export default router;
