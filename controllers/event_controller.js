const db = require('../libs/db');
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });

exports.getEvents = async function (req, res) {
    try {
      const result = await db.query(`
        SELECT *
        FROM tbl_events
        ORDER BY id DESC
      `);
  
        res.status(200).json({ 
            success: true,
            message: "Success",
            data: result.rows,
            rowCount: result.rows.length
        });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil data peserta." });
    }
  };

  exports.insertEvent = async function (req, res) {
    const { title, location, start_date, end_date, description } = req.body;
  
    try {
      const result = await db.query(`
        INSERT INTO tbl_events (title, location, start_date, end_date, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [title, location, start_date, end_date, description]);
  
      res.status(201).json({
        success: true,
        message: "Event berhasil ditambahkan.",
        data: result.rows[0]
      });
    } catch (error) {
      console.error("Error inserting event:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat menambahkan event." });
    }
  };

  
  exports.updateEvent = async function (req, res) {
    const id = req.params.id;
    const { title, location, start_date, end_date, description } = req.body;
  
    try {
      const result = await db.query(`
        UPDATE tbl_events 
        SET title = $1, location = $2, start_date = $3, end_date = $4, description = $5
        WHERE id = $6
        RETURNING *
      `, [title, location, start_date, end_date, description, id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Event tidak ditemukan." });
      }
  
      res.status(200).json({
        success: true,
        message: "Event berhasil diperbarui.",
        data: result.rows[0]
      });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat memperbarui event." });
    }
  };

  exports.deleteEvent = async function (req, res) {
    const id = req.params.id;
  
    try {
      const result = await db.query(`
        DELETE FROM tbl_events WHERE id = $1
      `, [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Event tidak ditemukan." });
      }
  
      res.status(200).json({
        success: true,
        message: "Event berhasil dihapus."
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat menghapus event." });
    }
  };
  