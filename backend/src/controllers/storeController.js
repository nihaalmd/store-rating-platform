const pool = require("../config/db");

async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length < 20 || name.trim().length > 60) {
      return res.status(400).json({
        message: "Store name must be between 20 and 60 characters",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Enter a valid store email",
      });
    }

    if (!address || address.trim().length > 400) {
      return res.status(400).json({
        message: "Address is required and must not exceed 400 characters",
      });
    }

    if (ownerId !== undefined && ownerId !== null) {
      const [owners] = await pool.execute(
        "SELECT id FROM users WHERE id = ? AND role = 'STORE_OWNER'",
        [ownerId]
      );

      if (owners.length === 0) {
        return res.status(400).json({
          message: "Store owner not found",
        });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim(), address.trim(), ownerId ?? null]
    );

    return res.status(201).json({
      message: "Store created successfully",
      store: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        ownerId: ownerId ?? null,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "A store with this email already exists",
      });
    }

    console.error("Create store error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getStores(req, res) {
  try {
    const [stores] = await pool.execute(
      `SELECT
         s.id,
         s.name,
         s.email,
         s.address,
         s.owner_id AS ownerId,
         COALESCE(AVG(r.rating), 0) AS overallRating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       GROUP BY s.id, s.name, s.email, s.address, s.owner_id
       ORDER BY s.name ASC`
    );

    return res.status(200).json({ stores });
  } catch (error) {
    console.error("Get stores error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { createStore, getStores };
