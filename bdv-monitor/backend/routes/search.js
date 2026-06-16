import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { monto, ref } = req.query;

    if (!monto && !ref) {
      return res.status(400).json({ error: "monto o ref requerido como query param" });
    }

    let query = "SELECT id, monto, usd, referencia, timestamp, package_name, raw_text, received_at FROM notifications WHERE 1=1";
    const values = [];
    let paramIndex = 1;

    if (monto) {
      // Normalizar monto: eliminar puntos de miles para que busque 1025,00
      const cleanMonto = monto.replace(/\.(?=\d{3})/g, "");
      query += ` AND monto ILIKE $${paramIndex}`;
      values.push(`%${cleanMonto}%`);
      paramIndex++;
    }

    if (ref) {
      // Buscar por sufijo: últimos 4 o 6 dígitos (ej: %2670, %232670)
      query += ` AND referencia ILIKE $${paramIndex}`;
      values.push(`%${ref}`);
      paramIndex++;
    }

    query += " ORDER BY received_at DESC LIMIT 100";

    const result = await pool.query(query, values);

    res.json({
      count: result.rows.length,
      results: result.rows,
    });
  } catch (err) {
    console.error("search error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
