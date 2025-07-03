const db = require('../libs/db');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode'); // pastikan sudah install: npm install qrcode
dotenv.config({ path: "./config.env" });

exports.getParticipants = async function (req, res) {
    try {
      const result = await db.query(`
        SELECT a.*, b.title, b.start_date, b.end_date, b.location
        FROM tbl_participants a
        join tbl_events b on (a.event_id = b.id)
        ORDER BY id DESC
      `);
  
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat mengambil data peserta." });
    }
  };

  // POST Approve participant
  exports.approveParticipant = async function (req, res) {
    const participantId = req.params.id;
    const client = await db.connect(); // Dapatkan koneksi untuk transaksi manual
  
    try {
      // Mulai transaksi
      await client.query('BEGIN');
  
      // Update status ke "approved"
      const result = await client.query(
        `UPDATE tbl_participants SET status = 'approved' WHERE id = $1 RETURNING *`,
        [participantId]
      );
  
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: "Peserta tidak ditemukan." });
      }
  
      const participant = result.rows[0];
      
      // Ambil event_name dari tabel tbl_events
      const eventResult = await client.query(
        `SELECT title FROM tbl_events WHERE id = $1`,
        [participant.event_id]
      );

      if (eventResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: "Event tidak ditemukan." });
      }

      const eventTitle = eventResult.rows[0].title;

      // Generate QR code image dari data qrcode (string)
      const qrImageDataUrl = await QRCode.toDataURL(participant.qrcode);

      // Siapkan transporter email
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      });
  
      await transporter.verify();
  
      const qrImageBuffer = await QRCode.toBuffer(participant.qrcode);

    const mailOptions = {
      from: `"PT. Sindigilive Teknologi Kreatif" <${process.env.GMAIL_USER}>`,
      to: "anggisaskia01@gmail.com",//participant.email,
      subject: 'Konfirmasi Persetujuan Pendaftaran Anda',
      html: `
        <p>Yth. <b>${participant.name}</b>,</p>
        <p>Terima kasih telah mendaftar untuk mengikuti acara <strong>${eventTitle}</strong>.</p>
        <p>Dengan ini kami informasikan bahwa <strong>pendaftaran Anda telah disetujui</strong>.</p>
        <p>Silakan membawa dan menunjukkan QR Code di bawah ini pada saat registrasi ulang di lokasi acara.</p>
        <p style="text-align: center;">
          <img src="cid:qrcode-image" alt="QR Code Anda" style="width: 300px; height: 300px;" />
        </p>
        <p>Mohon hadir tepat waktu dan membawa identitas diri yang sesuai saat registrasi.</p>
        <br>
        <p>Hormat kami,</p>
        <p><strong>Panitia ${eventTitle}</strong><br>
        PT. Sindigilive Teknologi Kreatif</p>
      `,
      attachments: [{
        filename: 'qrcode.png',
        content: qrImageBuffer,
        cid: 'qrcode-image' // harus sama dengan yang dipakai di src="cid:..."
      }]
    };

  
      await transporter.sendMail(mailOptions);
  
      // Commit transaksi jika semua berhasil
      await client.query('COMMIT');
  
      res.status(200).json({ message: "Peserta berhasil di-approve dan email telah dikirim." });
  
    } catch (error) {
      await client.query('ROLLBACK'); // Batalkan perubahan jika gagal
      console.error("Error approving participant or sending email:", error);
      res.status(500).json({ error: "Gagal meng-approve peserta atau mengirim email." });
    } finally {
      client.release(); // Pastikan koneksi dilepas
    }
  };
  
  // POST Reject participant
exports.rejectParticipant = async function (req, res) {
  const participantId = req.params.id;
  const { reason } = req.body; // Ambil alasan dari body request

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ error: "Alasan penolakan tidak boleh kosong." });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Update status ke 'rejected' DAN simpan alasan penolakan
    const result = await client.query(
      `UPDATE tbl_participants SET status = 'rejected', reject_reason = $1 WHERE id = $2 RETURNING *`,
      [reason, participantId]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Peserta tidak ditemukan." });
    }

    const participant = result.rows[0];
    
    // Ambil event_name dari tbl_events untuk email
    const eventResult = await client.query(
      `SELECT title FROM tbl_events WHERE id = $1`,
      [participant.event_id]
    );

    if (eventResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Event tidak ditemukan." });
    }
    const eventTitle = eventResult.rows[0].title;
    console.log(participant);
    console.log(eventTitle);

    // Konfigurasi transporter email
    const transporter = nodemailer.createTransport({
      port: 587,
      host: 'smtp.gmail.com',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
    await transporter.verify();

    const mailOptions = {
      from: `"PT. Sindigilive Teknologi Kreatif" <${process.env.GMAIL_USER}>`,
      to: "anggisaskia01@gmail.com",//participant.email,
      subject: `Informasi Pendaftaran Acara ${eventTitle}`, // Subjek lebih dinamis
      html: `
        <p>Yth. <b>${participant.name}</b>,</p>
        <p>Terima kasih telah mendaftar untuk mengikuti acara <strong>${eventTitle}</strong>.</p>
        <p>Dengan hormat, kami sampaikan bahwa setelah melalui proses verifikasi,</p>
        <p><strong>pendaftaran Anda belum dapat kami setujui</strong> untuk saat ini.</p>
        <p>Alasan penolakan: <strong>${reason}</strong></p> <p>Kami sangat menghargai minat dan partisipasi Anda, dan kami berharap dapat bertemu dengan Anda di kesempatan lainnya.</p>
        <br>
        <p>Hormat kami,</p>
        <p><strong>Panitia ${eventTitle}</strong><br>
        PT. Sindigilive Teknologi Kreatif</p>
        `
    };

    await transporter.sendMail(mailOptions);
    await client.query('COMMIT');

    res.status(200).json({ message: "Peserta berhasil ditolak dan email dikirim." });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error rejecting participant:", error);
    res.status(500).json({ error: "Gagal menolak peserta atau mengirim email." });
  } finally {
    client.release();
  }
};

// Ambil semua peserta
exports.getParticipants = async function (req, res) {
  const eventId = req.query.event_id;
  try {
    let query = `
          SELECT a.*, b.title, b.start_date, b.end_date, b.location
          FROM tbl_participants a
          join tbl_events b on (a.event_id = b.id)
        `;
    
        if (eventId) {
          query += ` WHERE a.event_id = $1`;
          query += ` ORDER BY a.entry_date DESC`;
          values = [eventId];
        } else {
          query += ` ORDER BY a.entry_date DESC`;
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
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data peserta." });
  }
};