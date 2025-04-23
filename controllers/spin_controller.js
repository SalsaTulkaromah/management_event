const db = require('../libs/db');

exports.getSpinPage = async (req, res) => {
  const { event_id } = req.body;
  try {
    const result = await db.query(`
          SELECT p.id,p.name
          FROM tbl_participants p
          JOIN tbl_attendance a ON p.id = a.participant_id
          JOIN tbl_events b on (p.event_id = b.id)
          WHERE a.scanned_at IS NOT NULL and p.is_winner = false and b.id = $1
          ORDER BY a.scanned_at DESC;
        `, [event_id]);
    
    res.status(200).json({ 
      success: true,
      message: "Success",
      data: result.rows,
      rowCount: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching attendees:', err);
    res.status(500).send('Internal Server Error');
  }

};

// CONTROLLER: set winner by participant ID
exports.setWinner = async (req, res) => {
  const { participant_id } = req.body;
  try {
    const result = await db.query(`
      UPDATE tbl_participants
      SET is_winner = TRUE
      WHERE id = $1
    `, [participant_id]);

    res.status(200).json({
      success: true,
      message: 'Pemenang berhasil disimpan!',
    });
  } catch (err) {
    console.error('Error updating winner:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan pemenang.' });
  }
};

// Controller untuk mengambil daftar pemenang
exports.getWinners = async (req, res) => {
  try {
    // Mengambil data peserta yang menang dengan informasi event
    const result = await db.query(`
      SELECT p.id AS participant_id, concat(p.name,' (',p.company_name,')') AS participant_name, e.title AS event_title
      FROM tbl_participants p
      JOIN tbl_events e ON p.event_id = e.id
      WHERE p.is_winner = TRUE
      ORDER BY p.id DESC
    `);

    const winners = result.rows;
    res.json({
      success: true,
      data: winners
    });
  } catch (err) {
    console.error('Error fetching winners:', err);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};