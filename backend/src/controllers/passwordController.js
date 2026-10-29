const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      newPassword.length > 16 ||
      !/[A-Z]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      return res.status(400).json({
        message:
          "New password must be 8-16 characters and contain an uppercase letter and a special character",
      });
    }

    if (typeof currentPassword !== "string" || !currentPassword) {
      return res.status(400).json({
        message: "Current password is required",
      });
    }

    const [users] = await pool.execute(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const matches = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!matches) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await pool.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    );

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { updatePassword };