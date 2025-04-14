const db = require('../libs/db');

exports.getAttendanceList = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, phone FROM tbl_participants WHERE status = 'attended' AND exchanged = false`
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.findParticipantByQRCode = async (req, res) => {
  const { qrcode } = req.body;

  try {
    const result = await db.query(
      `SELECT * FROM tbl_participants WHERE qrcode = $1`,
      [qrcode]
    );

    const participant = result.rows[0];

    if (!participant) {
      return res.json({ success: false });
    }

    // Jika belum hadir, tolak
    if (participant.status !== 'attended') {
      return res.json({ success: false, reason: 'not_attended' });
    }

    // Jika sudah ditukar souvenir
    if (participant.exchanged) {
      return res.json({ alreadyScanned: true, participant });
    }

    // Update status souvenir exchange
    await db.query(
      `UPDATE tbl_participants SET exchanged = true WHERE id = $1`,
      [participant.id]
    );

    return res.json({ success: true, participant });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
};
