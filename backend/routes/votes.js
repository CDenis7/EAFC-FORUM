const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  const { voteableId, voteableType, value } = req.body;
  const userId = req.user.id;

  if (![1, -1, 0].includes(value)) {
    return res.status(400).json({ error: 'Valoare de vot invalidă.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const table = voteableType === 'post' ? 'posts' : 'comments';

    const checkQuery = `
      SELECT value FROM votes 
      WHERE user_id = $1 AND voteable_id = $2 AND voteable_type = $3
    `;
    const checkRes = await client.query(checkQuery, [userId, voteableId, voteableType]);

    let voteDifference = 0;

    if (checkRes.rows.length > 0) {
      const existingValue = checkRes.rows[0].value;
      if (existingValue === value) {
        await client.query(
          'DELETE FROM votes WHERE user_id = $1 AND voteable_id = $2 AND voteable_type = $3',
          [userId, voteableId, voteableType]
        );
        voteDifference = -existingValue;
      } else {
        await client.query(
          'UPDATE votes SET value = $1 WHERE user_id = $2 AND voteable_id = $3 AND voteable_type = $4',
          [value, userId, voteableId, voteableType]
        );
        voteDifference = value - existingValue;
      }
    } else {
      await client.query(
        'INSERT INTO votes (user_id, voteable_id, voteable_type, value) VALUES ($1, $2, $3, $4)',
        [userId, voteableId, voteableType, value]
      );
      voteDifference = value;
    }
    await client.query(
      `UPDATE ${table} SET vote_count = vote_count + $1 WHERE id = $2`,
      [voteDifference, voteableId]
    );

    await client.query('COMMIT');
    res.json({ success: true, newVoteCount: voteDifference });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Vote Error:', error);
    res.status(500).json({ error: 'Eroare la procesarea votului.' });
  } finally {
    client.release();
  }
});

module.exports = router;