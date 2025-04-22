const db = require('../libs/db');

exports.getSpinPage = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.name
      FROM tbl_participants p
      JOIN tbl_attendance a ON p.id = a.participant_id
      WHERE a.scanned_at IS NOT NULL
      ORDER BY a.scanned_at DESC;
    `);
    
    const participants = result.rows.map(row => row.name);

    res.json(participants);
  } catch (err) {
    console.error('Error fetching attendees:', err);
    res.status(500).send('Internal Server Error');
  }

};
