const db = require('../libs/db');

exports.surveyEvent = async (req, res) => {
    try {
        const {
            participant_id, name, email, institution,
            materi_kelengkapan, materi_kesesuaian, materi_wawasan,
            penyampaian_jelas, penyampaian_diskusi,
            pemahaman_fitur, pemahaman_cara_kerja, pemahaman_demo,
            rekomendasi_penggunaan, relevansi_produk,
            kepuasan_total,
            suka_dari_event, saran_event, tertarik_info_lanjutan
        } = req.body;

        // ✅ CEK APAKAH SUDAH MENGISI SURVEI
        const { rows } = await db.query(
            'SELECT 1 FROM tbl_survey WHERE participant_id = $1 LIMIT 1',
            [participant_id]
        );

        if (rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Survei sudah pernah dikirim oleh peserta ini.'
            });
        }

        // ✅ JIKA BELUM, LANJUTKAN INSERT
        await db.query(`
            INSERT INTO tbl_survey (
                participant_id, name, email, institution,
                materi_kelengkapan, materi_kesesuaian, materi_wawasan,
                penyampaian_jelas, penyampaian_diskusi,
                pemahaman_fitur, pemahaman_cara_kerja, pemahaman_demo,
                rekomendasi_penggunaan, relevansi_produk,
                kepuasan_total,
                suka_dari_event, saran_event, tertarik_info_lanjutan
            ) VALUES (
                $1,$2,$3,$4,
                $5,$6,$7,
                $8,$9,
                $10,$11,$12,
                $13,$14,
                $15,
                $16,$17,$18
            )
        `, [
            participant_id, name, email, institution,
            materi_kelengkapan, materi_kesesuaian, materi_wawasan,
            penyampaian_jelas, penyampaian_diskusi,
            pemahaman_fitur, pemahaman_cara_kerja, pemahaman_demo,
            rekomendasi_penggunaan, relevansi_produk,
            kepuasan_total,
            suka_dari_event, saran_event, tertarik_info_lanjutan
        ]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Kesalahan server.' });
    }
};

