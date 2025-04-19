const db = require('../libs/db');

exports.getAttendanceList = async (req, res) => {
  const eventId = req.query.event_id;
  try {
    let query = `
      SELECT p.id, p.name, p.email, p.phone, p.qrcode, a.scanned_at, p.company_name, p.status,
      CASE WHEN a.scanned_at IS NOT NULL THEN 'Attended' ELSE 'Absent' END AS status_kehadiran,
      b.title, b.description
      FROM tbl_participants p
      LEFT JOIN tbl_attendance a ON p.id = a.participant_id
      JOIN tbl_events b ON p.event_id = b.id
    `;

    if (eventId) {
      query += ` WHERE p.event_id = $1`;
      query += ` ORDER BY a.scanned_at DESC`;
      values = [eventId];
    } else {
      query += ` ORDER BY a.scanned_at DESC`;
      values = [];
    }

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

exports.getParticipantByQRCode = async (req, res) => {
  const { qrcode } = req.query; // atau req.body jika pakai POST

  if (!qrcode) {
    return res.status(400).json({ error: 'QR Code is required' });
  }

  const query = `
    SELECT 
      p.id, 
      p.name, 
      p.email, 
      p.phone, 
      p.qrcode, 
      a.scanned_at,
      p.company_name,
      p.status,
      CASE 
        WHEN a.scanned_at IS NOT NULL THEN 'Hadir' 
        ELSE 'Absence' 
      END AS StatusKehadiran, 
      b.title,
      b.description,
      b.start_date, 
      b.end_date, 
      b.location
    FROM tbl_participants p
    LEFT JOIN tbl_attendance a ON p.id = a.participant_id
    JOIN tbl_events b ON p.event_id = b.id
    WHERE a.scanned_at IS NOT NULL
      AND p.qrcode = $1
    LIMIT 1
  `;

  try {
    const result = await db.query(query, [qrcode]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found or not yet scanned' });
    }

    return res.json({ data: result.rows[0] });

  } catch (err) {
    console.error('Error fetching participant by QR:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

