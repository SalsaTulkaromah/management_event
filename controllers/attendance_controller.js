const db = require('../libs/db');
const nodemailer = require("nodemailer");

exports.getAttendanceList = async (req, res) => {
  const eventId = req.query.event_id;
  try {
    let query = `
      SELECT p.id, p.name, p.email, p.phone, p.qrcode, a.scanned_at, p.company_name, p.status,
      CASE WHEN a.scanned_at IS NOT NULL THEN 'Attended' ELSE 'Absent' END AS status_kehadiran,
      b.title, b.description, a.isemail
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

exports.sendSurveyEmail = async (req, res) => {
  const { event_id } = req.body;

  if (!event_id) {
    return res.status(400).json({ error: "event_id is required." });
  }

  try {
    // Ambil peserta yang hadir
    const query = `
      SELECT p.name, p.email, b.title,p.id,p.qrcode
      FROM tbl_participants p
      JOIN tbl_attendance a ON p.id = a.participant_id
      JOIN tbl_events b ON p.event_id = b.id
      WHERE p.event_id = $1 AND a.scanned_at IS NOT NULL and isemail = false
    `;
    const result = await db.query(query, [event_id]);
    const participants = result.rows;

    if (participants.length === 0) {
      return res.status(404).json({ error: "Tidak ada peserta yang hadir untuk event ini." });
    }

    // Konfigurasi transport email (ambil dari config)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      });
      await transporter.verify();

    for (const p of participants) {
      console.log(p.title,p.name,p.email)
      const mailOptions = {
        from: `"PT. Sindigilive Teknologi Kreatif" <${process.env.GMAIL_USER}>`,
        to: p.email,
        subject: `Permohonan Pengisian Survei Kepuasan Event ${p.title}`,
        html: `
          <p>Yth. ${p.name},</p>
  
          <p>Terima kasih kami sampaikan atas kehadiran Anda dalam event <strong>${p.title}</strong>. Kami sangat menghargai partisipasi Anda dalam acara tersebut.</p>
  
          <p>Sebagai bagian dari upaya kami untuk terus meningkatkan kualitas layanan, kami mohon kesediaan Anda untuk meluangkan waktu sejenak guna mengisi survei kepuasan peserta yang dapat diakses melalui tautan berikut:</p>
  
          <p><a href="http://localhost:9000/survey?participant_code=${p.qrcode}" target="_blank">Klik di sini untuk mengisi survei</a></p>
  
          <p>Survei ini akan sangat membantu kami dalam memahami pengalaman Anda dan memperbaiki acara-acara mendatang.</p>
  
          <p>Terima kasih atas perhatian dan kerjasama Anda. Kami berharap dapat menyambut Anda kembali di acara kami yang berikutnya.</p>
  
          <p>Hormat kami,</p>
          <p><strong>Panitia ${eventTitle}</strong><br>PT. Sindigilive Teknologi Kreatif</p>
        `
    };    
      try {
        // Kirim email
        await transporter.sendMail(mailOptions);
    
        // Update isEmail = true jika berhasil kirim
        await db.query(
          `UPDATE tbl_attendance SET isEmail = TRUE WHERE participant_id = $1 AND event_id = $2`,
          [p.id, event_id]
        );
    
      } catch (error) {
        console.error(`Gagal mengirim email ke ${p.email}:`, error.message);
        // (Opsional) kamu bisa menyimpan log atau lanjut ke peserta berikutnya
      }

    }

    res.json({ message: `Email survey berhasil dikirim ke ${participants.length} partisipan.` });
  } catch (err) {
    console.error("Error sending survey emails:", err);
    res.status(500).json({ error: "Gagal mengirim email survey." });
  }
};