const db = require('../libs/db');

exports.getSurveyResponses = async (req, res) => {
  const eventId = req.query.event_id;
  try {

    let query = `
      SELECT a.*, b.event_id, c.title, c.start_date, c.end_date, c.location FROM tbl_survey a
      join tbl_participants b on (a.participant_id = b.id)
      join tbl_events c on (b.event_id = c.id)
    `;

    if (eventId) {
      query += ` WHERE b.event_id = $1`;
      query += ` ORDER BY a.created_at DESC`;
      values = [eventId];
    } else {
      query += ` ORDER BY a.created_at DESC`;
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
    console.error('Error loading survey data:', error);
    res.status(500).send('Internal Server Error');
  }
};