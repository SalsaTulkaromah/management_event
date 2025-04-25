const db = require('../libs/db');
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });

exports.getUsers = async function (req, res) {
  try {
    const result = await db.query(`
      SELECT *
      FROM tbl_login
      ORDER BY id DESC
    `);

    res.status(200).json({
      success: true,
      message: "Success",
      data: result.rows,
      rowCount: result.rows.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data user." });
  }
};

exports.upsertUser = async function (req, res) {
  const { id, fullname, email, password, role } = req.body;

  try {
    let result;

    if (id) {
      // Update existing user
      const oldUser = await db.query(`SELECT * FROM tbl_login WHERE id = $1`, [id]);
      if (oldUser.rowCount === 0) {
        return res.status(404).json({ success: false, message: "User tidak ditemukan." });
      }

      result = await db.query(`
        UPDATE tbl_login 
        SET fullname = $1, email = $2, password = $3, role = $4
        WHERE id = $5
        RETURNING *
      `, [fullname, email, password, role, id]);

      res.status(200).json({
        success: true,
        message: "User berhasil diperbarui.",
        data: result.rows[0]
      });
    } else {
      // Insert new user
      result = await db.query(`
        INSERT INTO tbl_login (fullname, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [fullname, email, password, role]);

      res.status(201).json({
        success: true,
        message: "User berhasil ditambahkan.",
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error("Error inserting/updating user:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    
    try {
      const result = await db.query('SELECT * FROM tbl_login WHERE id = $1', [userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const userData = result.rows[0]; // Mengambil user pertama dari hasil query
      res.json({ data: userData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async function (req, res) {
  const id = req.params.id;

  try {
    const result = await db.query(`
      DELETE FROM tbl_login WHERE id = $1
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan." });
    }

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus."
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus user." });
  }
};
