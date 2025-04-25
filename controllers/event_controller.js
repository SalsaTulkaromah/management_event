const db = require('../libs/db');
const dotenv = require('dotenv');
const path = require('path');
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

exports.getEventByID = async function (req, res) {
  const { event_id } = req.body;

  try {
    const result = await db.query(`
      SELECT *
      FROM tbl_events
      WHERE id = $1
    `, [event_id]);

    res.status(200).json({ 
      success: true,
      message: "Success",
      data: result.rows,
      rowCount: result.rows.length
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data event." });
  }
};

exports.upsertEvent = async function (req, res) {
  console.log("Received body:", req.body); // Log body request untuk memastikan data yang diterima
  const { id, title, location, start_date, end_date, description } = req.body;
  const image = req.files && req.files.image ? req.files.image : null;

  let imageName = null;
  if (image) {
    imageName = Date.now() + path.extname(image.name);
    const imagePath = path.join(__dirname, '../public/uploads', imageName);

    // Cek apakah file bisa dipindahkan ke folder uploads
    image.mv(imagePath, (err) => {
      if (err) {
        console.error('Error uploading image:', err);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengupload gambar.' });
      }
      console.log('Image uploaded successfully:', imagePath);
    });
  }

  try {
    let result;

    if (id) {
      console.log("Updating event with ID:", id);
      const oldEvent = await db.query(`SELECT * FROM tbl_events WHERE id = $1`, [id]);
      if (oldEvent.rowCount === 0) {
        return res.status(404).json({ success: false, message: "Event tidak ditemukan." });
      }

      const finalImage = imageName || oldEvent.rows[0].image;
      console.log("Using image:", finalImage);
      
      result = await db.query(`
        UPDATE tbl_events 
        SET title = $1, location = $2, start_date = $3, end_date = $4, description = $5, image = $6
        WHERE id = $7
        RETURNING *
      `, [title, location, start_date, end_date, description, finalImage, id]);

      res.status(200).json({
        success: true,
        message: "Event berhasil diperbarui.",
        data: result.rows[0]
      });
    } else {
      console.log("Inserting new event.");
      result = await db.query(`
        INSERT INTO tbl_events (title, location, start_date, end_date, description, image)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [title, location, start_date, end_date, description, imageName]);

      res.status(201).json({
        success: true,
        message: "Event berhasil ditambahkan.",
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error("Error inserting/updating event:", error); // Log error lebih jelas
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
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

exports.toggleActive = async function (req, res) {
  const id = req.params.id;
  let { isactive } = req.body;

  // Konversi ke integer (pastikan benar antara 1 dan 0)
  isactive = parseInt(isactive); // Atau +isactive untuk singkat

  try {
    const event = await db.query(`SELECT * FROM tbl_events WHERE id = $1`, [id]);
    if (event.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Event tidak ditemukan." });
    }

    await db.query(`UPDATE tbl_events SET isactive = $1 WHERE id = $2`, [isactive, id]);

    res.status(200).json({
      success: true,
      message: `Event berhasil di-${isactive === 1 ? 'aktifkan' : 'nonaktifkan'}.`
    });
  } catch (error) {
    console.error("Error updating isactive:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat memperbarui status event." });
  }
};