const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  const { voteableId, voteableType, value } = req.body;
  const userId = req.user.id;

  // Only allow +1, -1. (0 is not used in request, handled by toggle logic)
  if (![1, -1].includes(value)) {
    return res.status(400).json({ error: 'Valoare de vot invalidă.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Determine target table
    const table = voteableType === 'post' ? 'posts' : 'comments';

    // Check if user has already voted on this item
    const checkQuery = `
      SELECT value FROM votes 
      WHERE user_id = $1 AND voteable_id = $2 AND voteable_type = $3
    `;
    const checkRes = await client.query(checkQuery, [userId, voteableId, voteableType]);

    let voteDifference = 0;
    let userVoteStatus = 0; // 0 = none, 1 = up, -1 = down

    if (checkRes.rows.length > 0) {
      const existingValue = checkRes.rows[0].value;
      
      if (existingValue === value) {
        // User clicked the same vote again (e.g., Upvoted an Upvote) -> Remove vote (Toggle off)
        await client.query(
          'DELETE FROM votes WHERE user_id = $1 AND voteable_id = $2 AND voteable_type = $3',
          [userId, voteableId, voteableType]
        );
        voteDifference = -existingValue; // Reverse the previous effect
        userVoteStatus = 0;
      } else {
        // User changed vote (e.g., Changed Upvote to Downvote)
        await client.query(
          'UPDATE votes SET value = $1 WHERE user_id = $2 AND voteable_id = $3 AND voteable_type = $4',
          [value, userId, voteableId, voteableType]
        );
        // If changing 1 to -1, diff is -2. If -1 to 1, diff is 2.
        voteDifference = value - existingValue;
        userVoteStatus = value;
      }
    } else {
      // New vote
      await client.query(
        'INSERT INTO votes (user_id, voteable_id, voteable_type, value) VALUES ($1, $2, $3, $4)',
        [userId, voteableId, voteableType, value]
      );
      voteDifference = value;
      userVoteStatus = value;
    }

    // Update the total count on the parent table and return the new count
    const updateRes = await client.query(
      `UPDATE ${table} SET vote_count = vote_count + $1 WHERE id = $2 RETURNING vote_count`,
      [voteDifference, voteableId]
    );

    await client.query('COMMIT');
    
    // Return the new total score and the user's specific vote status
    res.json({ 
        success: true, 
        newVoteCount: updateRes.rows[0].vote_count,
        userVote: userVoteStatus
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Vote Error:', error);
    res.status(500).json({ error: 'Eroare la procesarea votului.' });
  } finally {
    client.release();
  }
});

module.exports = router;