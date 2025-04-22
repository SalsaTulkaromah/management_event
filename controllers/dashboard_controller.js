const db = require('../libs/db');

exports.getDashboard = async (req, res) => {
  try {
    const totalParticipants = await db.one('SELECT COUNT(*) FROM tbl_participants');
    const totalRespondents = await db.one('SELECT COUNT(DISTINCT participant_id) FROM tbl_survey');
    const totalEvents = await db.one('SELECT COUNT(*) FROM tbl_events');
    const avgCSAT = await db.one('SELECT ROUND(AVG(score) * 20, 2) as avg_score FROM tbl_survey'); // score 1–5 → 20%–100%

    res.render('dashboard', {
      totalParticipants: totalParticipants.count,
      totalRespondents: totalRespondents.count,
      totalEvents: totalEvents.count,
      avgCSAT: avgCSAT.avg_score
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Internal Server Error');
  }
};
