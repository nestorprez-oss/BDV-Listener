import { Router } from "express";
import pool from "../db.js";

const router = Router();

const TASA_API_URL = "https://blocco.restaurant/api/tasa";

async function fetchTasa() {
  try {
    const res = await fetch(TASA_API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && typeof data.tasa === "number" && data.tasa > 0) {
      return data.tasa;
    }
    throw new Error("Tasa inválida en respuesta");
  } catch (err) {
    console.error("fetchTasa error:", err.message);
    return null;
  }
}

function parseMontoToNumber(montoStr) {
  // Convertir "1025,00" -> 1025.00
  if (!montoStr) return 0;
  const cleaned = montoStr.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

router.post("/", async (req, res) => {
  try {
    const { monto, referencia, timestamp, package_name, raw_text } = req.body;

    if (!monto && !referencia) {
      return res.status(400).json({ error: "monto o referencia requerido" });
    }

    // Normalizar monto: eliminar puntos de miles (ej: 1.025,00 -> 1025,00)
    const normalizedMonto = (monto || "").replace(/\.(?=\d{3})/g, "");

    // Calcular USD
    const montoNum = parseMontoToNumber(normalizedMonto);
    const tasa = await fetchTasa();
    const usd = tasa && montoNum > 0 ? parseFloat((montoNum / tasa).toFixed(2)) : null;

    const query = `
      INSERT INTO notifications (monto, usd, referencia, timestamp, package_name, raw_text)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, received_at
    `;

    const values = [
      normalizedMonto,
      usd,
      referencia || "",
      timestamp || Date.now(),
      package_name || "",
      raw_text || "",
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      ok: true,
      id: result.rows[0].id,
      received_at: result.rows[0].received_at,
      usd,
    });
  } catch (err) {
    console.error("webhook error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
