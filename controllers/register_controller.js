const db = require('../libs/db');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto'); // untuk generate QR code
dotenv.config({ path: "./config.env" });

exports.registerEvent = async function (req, res) {
    const { nama, institution, email, phone, event_guid } = req.body;
    const image = req.files?.image;

    try {
        // 1. Validasi Event GUID
        const eventResult = await db.query('SELECT id FROM tbl_events WHERE guid = $1', [event_guid]);
        if (eventResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Event tidak ditemukan.',
            });
        }

        const event_id = eventResult.rows[0].id;

        // 2. Cek apakah email sudah terdaftar pada event yang sama
        const check = await db.query(
            'SELECT * FROM tbl_participants WHERE email = $1 AND event_id = $2',
            [email, event_id]
        );
        if (check.rows.length > 0) {
            return res.status(200).json({
                success: false,
                message: "Email sudah digunakan pada event ini.",
            });
        }

        // 4. Simpan Gambar
        let imageName = '';
        if (image) {
            imageName = Date.now() + path.extname(image.name);
            const uploadPath = path.join(__dirname, '../public/uploads', imageName);
            await image.mv(uploadPath);
        }

        // 5. Insert ke database
        const result = await db.query(
            `INSERT INTO tbl_participants (name, company_name, email, phone, image, status, event_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nama, institution, email, phone, imageName, 'pending', event_id]
        );

        // 6. Kirim QR Code via email (opsional)

        res.status(200).json({
            success: true,
            message: "Pendaftaran berhasil. QR Code akan dikirimkan melalui email Anda.",
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server",
        });
    }
};


exports.validateEventGuid = async function (req, res) {
    const { guid } = req.query;

    try {
        const result = await db.query('SELECT * FROM tbl_events WHERE guid = $1', [guid]);

        if (result.rows.length === 0) {
            return res.json({ valid: false, message: 'Event tidak ditemukan' });
        }

        const event = result.rows[0];
        const today = new Date();
        const endDate = new Date(event.end_date);

        // ✅ Valid jika hari ini belum lewat dari tanggal berakhir
        if (today <= endDate) {
            return res.json({ valid: true, event });
        } else {
            return res.json({
                valid: false,
                message: 'Event sudah berakhir. Pendaftaran tidak tersedia.'
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ valid: false, message: 'Kesalahan server' });
    }
};