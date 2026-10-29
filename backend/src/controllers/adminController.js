
const pool = require("../config/db");

async function getDashboardStats(req, res) {
  try {
    const [userRows] = await pool.execute(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    const [storeRows] = await pool.execute(
      "SELECT COUNT(*) AS totalStores FROM stores"
    );

    const [ratingRows] = await pool.execute(
      "SELECT COUNT(*) AS totalRatings FROM ratings"
    );

    return res.status(200).json({
      totalUsers: userRows[0].totalUsers,
      totalStores: storeRows[0].totalStores,
      totalRatings: ratingRows[0].totalRatings,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { getDashboardStats };
