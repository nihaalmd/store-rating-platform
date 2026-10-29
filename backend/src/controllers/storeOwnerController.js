const pool = require("../config/db");

async function getDashboard(req, res) {
  try {
    const [stores] = await pool.execute(
      `SELECT id, name
       FROM stores
       WHERE owner_id = ?`,
      [req.user.id]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        message: "No store is assigned to this account",
      });
    }

    const store = stores[0];

    const [summary] = await pool.execute(
      `SELECT
         COUNT(r.id) AS totalRatings,
         COALESCE(AVG(r.rating), 0) AS averageRating
       FROM ratings r
       WHERE r.store_id = ?`,
      [store.id]
    );

    const [raters] = await pool.execute(
      `SELECT
         u.id AS userId,
         u.name,
         u.email,
         r.rating,
         r.created_at AS ratedAt,
         r.updated_at AS updatedAt
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    return res.status(200).json({
      store,
      totalRatings: summary[0].totalRatings,
      averageRating: Number(summary[0].averageRating),
      raters,
    });
  } catch (error) {
    console.error("Store owner dashboard error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { getDashboard };