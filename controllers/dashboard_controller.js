const db = require('../libs/db');

exports.getEventStats = async function (req, res) {
  const { event_id } = req.body;
  try {
    const result = await db.query(`
      SELECT
        -- Jumlah registrasi, filter jika event_id != 0
        (SELECT COUNT(*)
         FROM tbl_participants
         WHERE ($1::int = 0 OR event_id = $1::int)
        ) AS registrations,

        -- Jumlah hadir, filter jika event_id != 0
        (SELECT COUNT(*)
         FROM tbl_attendance
         WHERE ($1::int = 0 OR event_id = $1::int)
        ) AS attendance,

        -- Total event (tidak bergantung pada filter)
        (SELECT COUNT(*) FROM tbl_events) AS event_data,

        -- Jumlah survey, filter jika event_id != 0
        (SELECT COUNT(DISTINCT s.participant_id)
         FROM tbl_survey s
         JOIN tbl_participants p ON s.participant_id = p.id
         WHERE ($1::int = 0 OR p.event_id = $1::int)
        ) AS survey_count
    `, [event_id]);

    res.status(200).json({
      success: true,
      message: 'Success',
      data: result.rows,
      rowCount: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching event stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
