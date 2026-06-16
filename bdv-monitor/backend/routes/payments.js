import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/payments?page=1&limit=20
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) AS total FROM notifications";
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total);

    const dataQuery = `
      SELECT id, monto, usd, referencia, timestamp, package_name, raw_text, received_at
      FROM notifications
      ORDER BY received_at DESC
      LIMIT $1 OFFSET $2
    `;
    const dataResult = await pool.query(dataQuery, [limit, offset]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      results: dataResult.rows,
    });
  } catch (err) {
    console.error("payments error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/payments/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM notifications WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }
    res.json({ ok: true, deleted: id });
  } catch (err) {
    console.error("delete error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
