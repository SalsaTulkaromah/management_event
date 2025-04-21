const db = require('../libs/db');

exports.getSpinList = async (req, res) => {
  const eventId = req.query.event_id;
  try {
    let query = `
      SELECT p.name, p.email, p.phone, p.company_name, b.title
      FROM tbl_participants p
      INNER JOIN tbl_attendance a ON p.id = a.participant_id -- hanya yang hadir
      JOIN tbl_events b ON p.event_id = b.id
    `;

    let values = [];

    if (eventId) {
      query += ` WHERE p.event_id = $1`;
      values = [eventId];
    }

    query += ` ORDER BY a.scanned_at DESC`;

    const result = await db.query(query, values);

    res.status(200).json({
      success: true,
      message: "Success",
      data: result.rows,
      rowCount: result.rows.length
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data kehadiran." });
  }
};
