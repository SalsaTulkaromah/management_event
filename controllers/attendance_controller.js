const db = require('../libs/db');

exports.getAttendanceList = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.name, p.email, p.phone, p.qrcode, a.scanned_at,p.company_name,p.status
        FROM tbl_attendance a
        JOIN tbl_participants p ON p.id = a.participant_id
        ORDER BY a.scanned_at DESC
    `);
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


exports.getAttendedParticipants = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT name FROM tbl_participants
      INNER JOIN tbl_attendance ON tbl_participants.id = tbl_attendance.participant_id
      WHERE tbl_attendance.status = 'Attended'
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: 'Failed to get participants' });
  }
};
