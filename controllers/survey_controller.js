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
