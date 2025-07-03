const db = require('../libs/db');

// Mengambil statistik event
exports.getEventStats = async function (req, res) {
  const { event_id } = req.body;
  try {
    const result = await db.query(`
      SELECT
        -- Jumlah registrasi
        (SELECT COUNT(*) FROM tbl_participants WHERE ($1::int = 0 OR event_id = $1::int)) AS registrations,
        -- Jumlah hadir
        (SELECT COUNT(*) FROM tbl_attendance WHERE ($1::int = 0 OR event_id = $1::int)) AS attendance,
        -- Total event
        (SELECT COUNT(*) FROM tbl_events) AS event_data,
        -- Jumlah survey
        (SELECT COUNT(DISTINCT s.participant_id)
         FROM tbl_survey s
         JOIN tbl_participants p ON s.participant_id = p.id
         WHERE ($1::int = 0 OR p.event_id = $1::int)) AS survey_count
    `, [event_id]);

    // Ambil detail datanya
    const [registrationDetails, attendanceDetails, eventDetails, surveyDetails] = await Promise.all([
      db.query(`
        SELECT id, name,company_name, email, phone
        FROM tbl_participants
        WHERE ($1::int = 0 OR event_id = $1::int)
      `, [event_id]),
      db.query(`
        SELECT a.id, p.name, p.email, a.scanned_at
        FROM tbl_attendance a
        JOIN tbl_participants p ON a.participant_id = p.id
        WHERE ($1::int = 0 OR a.event_id = $1::int)
      `, [event_id]),
      db.query(`
        SELECT id, title, location, start_date, end_date
        FROM tbl_events
      `), // event ga perlu filter event_id
      db.query(`
        SELECT DISTINCT s.id, p.name, p.email, p.company_name
        FROM tbl_survey s
        JOIN tbl_participants p ON s.participant_id = p.id
        WHERE ($1::int = 0 OR p.event_id = $1::int)
      `, [event_id])
    ]);

    res.status(200).json({
      success: true,
      message: 'Success',
      data: result.rows,
      rowCount: result.rows.length,
      details: {
        registrations: registrationDetails.rows,
        attendance: attendanceDetails.rows,
        events: eventDetails.rows,
        surveys: surveyDetails.rows
      }
    });

  } catch (err) {
    console.error('Error fetching event stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mengambil distribusi kepuasan dari survey
exports.getSurveyDistribution = async (req, res) => {
    const { event_id } = req.body;

    try {
        const result = await db.query(`
            SELECT 
                materi_kelengkapan, materi_kesesuaian, materi_wawasan,
                penyampaian_jelas, penyampaian_diskusi,
                pemahaman_fitur, pemahaman_cara_kerja, pemahaman_demo,
                rekomendasi_penggunaan, relevansi_produk, kepuasan_total
            FROM tbl_survey a
            JOIN tbl_participants b ON (a.participant_id = b.id)
            WHERE ($1::int = 0 OR b.event_id = $1::int)
        `, [event_id]);

        // Hitung distribusi untuk setiap kategori
        const satisfactionDistribution = {
            sangatPuas: 0,
            puas: 0,
            cukup: 0,
            tidakPuas: 0,
            sangatTidakPuas: 0 // Tambahkan kategori ini
        };
        // Array untuk menyimpan hasil pertanyaan yang "Tidak Puas"
        const tidakPuasResults = {};
        const cukupResults = {};
        const puasResults = {};
        const sangatPuasResults = {};
        const sangatTidakPuasResults = {}; // Tambahkan ini

        result.rows.forEach(row => {
            // Cek semua kolom di dalam row
            for (let key in row) {
                if (typeof row[key] === 'number') { // Pastikan value-nya angka dulu
                    if (row[key] >= 5) { // Asumsi 4 dan 5 adalah "Sangat Puas" (atau 5 saja jika Anda ingin membedakan 4 sebagai "Puas")
                        satisfactionDistribution.sangatPuas += 1;
                        if (!sangatPuasResults[key]) {
                            sangatPuasResults[key] = 0;
                        }
                        sangatPuasResults[key] += 1;
                    } else if (row[key] === 4) {
                        satisfactionDistribution.puas += 1;
                        if (!puasResults[key]) {
                            puasResults[key] = 0;
                        }
                        puasResults[key] += 1;
                    } else if (row[key] === 3) {
                        satisfactionDistribution.cukup += 1;
                        if (!cukupResults[key]) {
                            cukupResults[key] = 0;
                        }
                        cukupResults[key] += 1;
                    } else if (row[key] === 2) { 
                        satisfactionDistribution.tidakPuas += 1;
                        if (!tidakPuasResults[key]) {
                            tidakPuasResults[key] = 0;
                        }
                        tidakPuasResults[key] += 1;
                    } else if (row[key] === 1) { 
                        satisfactionDistribution.sangatTidakPuas += 1;
                        if (!sangatTidakPuasResults[key]) {
                            sangatTidakPuasResults[key] = 0;
                        }
                        sangatTidakPuasResults[key] += 1;
                    }
                }
            }
        });

        // 1. Hitung total jawaban dari semua kategori
        const total = satisfactionDistribution.sangatPuas +
                      satisfactionDistribution.puas +
                      satisfactionDistribution.cukup +
                      satisfactionDistribution.tidakPuas +
                      satisfactionDistribution.sangatTidakPuas;

        // Menghitung persentase distribusi (sesuai urutan label di EJS: Sangat Puas, Puas, Cukup, Tidak Puas, Sangat Tidak Puas)
        const chartData = [
            (satisfactionDistribution.sangatPuas / total) * 100,
            (satisfactionDistribution.puas / total) * 100,
            (satisfactionDistribution.cukup / total) * 100,
            (satisfactionDistribution.tidakPuas / total) * 100,
            (satisfactionDistribution.sangatTidakPuas / total) * 100
        ];

        // Total puas = sangat puas + puas
        const totalPuas = satisfactionDistribution.sangatPuas + satisfactionDistribution.puas;
        
        // Hitung CSAT
        const csat = (totalPuas / total) * 100;

        res.status(200).json({
            success: true,
            chartData: chartData,
            csat: csat.toFixed(2),
            totalResponses: result.rows.length, // Total baris dari query
            totalPuas: totalPuas,
            total: total,
            tidakPuasResults: tidakPuasResults,
            cukupResults: cukupResults,
            puasResults: puasResults,
            sangatPuasResults: sangatPuasResults,
            sangatTidakPuasResults: sangatTidakPuasResults // Kirimkan ini juga
        });
    } catch (err) {
        console.error("Error fetching survey distribution:", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.getCSATForAllEvents = async (req, res) => {
  const { event_id } = req.body;
  try {
    // Query untuk mengambil data survey dari semua even

    const result = await db.query(`
      SELECT 
        b.event_id, c.title,
        materi_kelengkapan, materi_kesesuaian, materi_wawasan,
        penyampaian_jelas, penyampaian_diskusi,
        pemahaman_fitur, pemahaman_cara_kerja, pemahaman_demo,
        rekomendasi_penggunaan, relevansi_produk, kepuasan_total
      FROM tbl_survey a
      JOIN tbl_participants b ON (a.participant_id = b.id)
      JOIN tbl_events c ON (b.event_id = c.id)
      where ($1::int = 0 OR b.event_id = $1::int)
    `, [event_id]);
    // Objek untuk menyimpan distribusi kepuasan per event
    const eventCSAT = {};

    // Loop melalui hasil survey dan hitung distribusi untuk tiap event
    result.rows.forEach(row => {
      const eventId = row.event_id;

      
      if (!eventCSAT[eventId]) {
        eventCSAT[eventId] = {
          title: row.title,
          sangatPuas: 0,
          puas: 0,
          cukup: 0,
          tidakPuas: 0,
          sangatTidakPuas: 0,
          totalResponses: 0
        };
      }

      // Hitung distribusi kepuasan untuk tiap event
      for (let key in row) {
        if (typeof row[key] === 'number' && key !== 'event_id') {
          if (row[key] >= 5) {
            eventCSAT[eventId].sangatPuas += 1;
          } else if (row[key] === 4) { // Jika nilai = 3, puas
            eventCSAT[eventId].puas += 1;
          } else if (row[key] === 3) { // Jika nilai = 2, cukup
            eventCSAT[eventId].cukup += 1;
          } else if (row[key] <= 2) { // Jika nilai <= 1, tidak puas
            eventCSAT[eventId].tidakPuas += 1;
          } else if (row[key] <= 1) { // Jika nilai <= 1, tidak puas
            eventCSAT[eventId].sangatTidakPuas += 1;
          }
        }
      }
      // Tambah total responses untuk event tersebut
      eventCSAT[eventId].totalResponses += 1;
    });

    // Array untuk menyimpan hasil CSAT per event
    const csatResults = [];

    // Menghitung CSAT untuk setiap event
    for (let eventId in eventCSAT) {
      const event = eventCSAT[eventId];
      const total = event.sangatPuas + event.puas + event.cukup + event.tidakPuas + event.sangatTidakPuas;
      const totalPuas = event.sangatPuas + event.puas;
      const csat = total === 0 ? 0 : (totalPuas / total) * 100;

      csatResults.push({
        event_id: eventId,
        title: event.title,
        sangatPuas: event.sangatPuas,
        puas: event.puas,
        cukup: event.cukup,
        tidakPuas: event.tidakPuas,
        sangatTidakPuas: event.sangatTidakPuas,
        csat: csat.toFixed(2),
        totalResponses: event.totalResponses,
        total:total
      });
    }

    // Mengembalikan data CSAT untuk semua event
    res.status(200).json({
      success: true,
      csatResults: csatResults
    });

  } catch (err) {
    console.error("Error fetching CSAT for all events:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.getParticipantsStatus = async (req, res) => {
  try {
    const { event_id } = req.body;
    const result = await db.query(`
      SELECT status, COUNT(*) as total
      FROM tbl_participants
      WHERE ($1::int = 0 OR event_id = $1::int)
      GROUP BY status
    `, [event_id]);
    
    // Query untuk ambil data peserta
    const participantsResult = await db.query(`
      SELECT *
      FROM tbl_participants
      WHERE ($1::int = 0 OR event_id = $1::int)
    `, [event_id]);

    // Format hasil query jadi object
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    result.rows.forEach(row => {
      const status = row.status;
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status] = parseInt(row.total, 10);
      }
    });

    res.status(200).json({
      success: true,
      data: statusCounts,
      participants: participantsResult.rows
    });
  } catch (error) {
    console.error('Error fetching participants status:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getSurveyResponses = async (req, res) => {
  const { event_id, label } = req.body;
  try {
    const result = await db.query(`
      SELECT a.*, b.event_id, c.title, c.start_date, c.end_date, c.location 
      FROM tbl_survey a
      JOIN tbl_participants b ON (a.participant_id = b.id)
      JOIN tbl_events c ON (b.event_id = c.id)
      WHERE 
        ($1::int = 0 OR c.id = $1::int) 
        AND (
             $2::int = 0 
             OR 
             ($2::int = 4 AND a.kepuasan_total IN (4, 5)) 
             OR 
             a.kepuasan_total = $2::int
        )
    `, [event_id, label]);
    
    res.status(200).json({ 
      success: true,
      message: "Success",
      data: result.rows,
      rowCount: result.rows.length
  });
  } catch (error) {
    console.error('Error loading survey data:', error);
    res.status(500).send('Internal Server Error');
  }
};