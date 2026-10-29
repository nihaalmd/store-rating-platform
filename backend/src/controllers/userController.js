const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || name.trim().length < 20 || name.trim().length > 60) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email address",
      });
    }

    if (
      !password ||
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and contain an uppercase letter and a special character",
      });
    }

    if (!address || address.trim().length > 400) {
      return res.status(400).json({
        message: "Address is required and cannot exceed 400 characters",
      });
    }

    if (!["ADMIN", "USER", "STORE_OWNER"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), hashedPassword, address.trim(), role]
    );

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getUsers(req, res) {
  try {
    const {
      name = "",
      email = "",
      address = "",
      role = "",
      sortBy = "name",
      order = "asc",
    } = req.query;

    const allowedSortColumns = {
      name: "name",
      email: "email",
      address: "address",
      role: "role",
    };

    const sortColumn = allowedSortColumns[sortBy] || "name";
    const sortOrder = order.toLowerCase() === "desc" ? "DESC" : "ASC";

    let sql = `
      SELECT id, name, email, address, role
      FROM users
      WHERE name LIKE ?
        AND email LIKE ?
        AND address LIKE ?
    `;

    const params = [
      `%${name}%`,
      `%${email}%`,
      `%${address}%`,
    ];

    if (role) {
      sql += " AND role = ?";
      params.push(role);
    }

    sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const [users] = await pool.execute(sql, params);

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getUserById(req, res) {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, address, role
       FROM users
       WHERE id = ?`,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    if (user.role === "STORE_OWNER") {
      const [stores] = await pool.execute(
        `SELECT
           s.id,
           s.name,
           COALESCE(AVG(r.rating), 0) AS overallRating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?
         GROUP BY s.id, s.name`,
        [user.id]
      );

      user.stores = stores;
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { createUser, getUsers, getUserById };
