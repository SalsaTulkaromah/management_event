const db = require('../libs/db');

exports.renderScanPage = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tbl_participants ORDER BY id ASC');
    res.render('scan-participant', {
      title: 'Scan Participant',
      participants: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.findParticipantByQRCode = async (req, res) => {
    const { qrcode } = req.body;
    try {
      const result = await db.query('SELECT * FROM tbl_participants WHERE qrcode = $1', [qrcode]);
  
      if (result.rows.length === 0) {
        return res.json({ success: false, message: 'Participant not found' });
      }
  
      const participant = result.rows[0];
  
      // Cek apakah sudah pernah hadir
      const check = await db.query(
        'SELECT * FROM tbl_attendance WHERE participant_id = $1 AND event_id = $2',
        [participant.id, participant.event_id]
      );
  
      if (check.rows.length > 0) {
        // Sudah pernah hadir
        return res.json({
          success: false,
          message: 'Peserta sudah tercatat hadir sebelumnya.',
          alreadyScanned: true,
          participant: {
            ...participant
          }
        });
      }
  
      // Belum hadir → catat kehadiran
      await db.query(
        'INSERT INTO tbl_attendance (participant_id, event_id) VALUES ($1, $2)',
        [participant.id, participant.event_id]
      );
  
      res.json({
        success: true,
        participant: {
          ...participant
        }
      });
  
    } catch (err) {
      console.error('Scan Error:', err);
      res.status(500).json({ success: false, message: 'Server error saat proses scan' });
    }
};

exports.getAttendanceList = async (req, res) => {
    try {
      const result = await db.query(`
        SELECT p.id, p.name, p.email, p.phone, p.qrcode, a.scanned_at
        FROM tbl_attendance a
        JOIN tbl_participants p ON p.id = a.participant_id
        ORDER BY a.scanned_at DESC
      `);
      res.json({ data: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ data: [] });
    }
  };
  
