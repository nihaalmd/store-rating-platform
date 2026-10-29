const pool = require("../config/db");

async function submitRating(req, res) {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!Number.isInteger(storeId) || storeId < 1) {
      return res.status(400).json({
        message: "A valid storeId is required",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be an integer from 1 to 5",
      });
    }

    const [stores] = await pool.execute(
      "SELECT id FROM stores WHERE id = ?",
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    const [existingRatings] = await pool.execute(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [userId, storeId]
    );

    if (existingRatings.length > 0) {
      await pool.execute(
        `UPDATE ratings
         SET rating = ?
         WHERE user_id = ? AND store_id = ?`,
        [rating, userId, storeId]
      );

      return res.status(200).json({
        message: "Rating updated successfully",
        rating,
      });
    }

    await pool.execute(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)`,
      [userId, storeId, rating]
    );

    return res.status(201).json({
      message: "Rating submitted successfully",
      rating,
    });
  } catch (error) {
    console.error("Submit rating error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getMyRatings(req, res) {
  try {
    const [ratings] = await pool.execute(
      `SELECT
         r.id,
         r.store_id AS storeId,
         s.name AS storeName,
         s.address,
         r.rating,
         r.created_at AS createdAt,
         r.updated_at AS updatedAt
       FROM ratings r
       JOIN stores s ON s.id = r.store_id
       WHERE r.user_id = ?
       ORDER BY s.name ASC`,
      [req.user.id]
    );

    return res.status(200).json({ ratings });
  } catch (error) {
    console.error("Get ratings error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { submitRating, getMyRatings };