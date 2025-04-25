const db = require('../libs/db');

exports.getAttendanceList = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.id,a.exchanged_at, a.participant_id, b.name, b.company_name, b.email, b.phone,c.title, c.description
      FROM tbl_souvenir a
      join tbl_participants b on (a.participant_id = b.id) 
      join tbl_events c on (b.event_id = c.id) and (c.isactive = 1)
      order by a.exchanged_at desc`
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
        `select a.*, b.name, b.company_name, b.email, b.phone, b.image, b.qrcode from tbl_attendance a
          join tbl_participants b on (a.participant_id = b.id)
          where b.qrcode = $1 limit 1`,
        [qrcode]
      );

      if (result.rows.length === 0) {
        return res.json({ success: false, message: 'Participant not found' });
      }
  
      const participant = result.rows[0];
  
      // Cek apakah sudah pernah hadir
      const check = await db.query(
        'SELECT * FROM tbl_souvenir WHERE participant_id = $1',
        [participant.participant_id]
      );
  
      if (check.rows.length > 0) {
        // Sudah pernah hadir
        return res.json({
          success: false,
          message: 'Peserta sudah tercatat menghambil souvenir sebelumnya.',
          alreadyScanned: true,
          participant: {
            ...participant
          }
        });
      }
  
      // Belum hadir → catat kehadiran
      await db.query(
        'INSERT INTO tbl_souvenir (participant_id, event_id) VALUES ($1, $2)',
        [participant.participant_id, participant.event_id]
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