const db = require('../libs/db');

exports.getSpinPage = async (req, res) => {
  try {
    const result = await db.query(
      `
        
    `);
    const participants = result.rows.map(row => row.name);

    res.render('/getSpinPage', { participants });
  } catch (err) {
    console.error('Error fetching attendees:', err);
    res.status(500).send('Internal Server Error');
  }
};
