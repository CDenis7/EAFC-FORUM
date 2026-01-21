const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { checkAchievements } = require('../utils/achievementService');

router.post('/', authMiddleware, async (req, res) => {
  const { content, postId, parentCommentId } = req.body;

  try {
    const postCheck = await db.query('SELECT is_closed FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows[0]?.is_closed) {
      return res.status(403).json({ error: 'Acest thread este încheiat. Nu se mai pot adăuga replici.' });
    }

    const { rows } = await db.query(
      'INSERT INTO comments (content, user_id, post_id, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [content, req.user.id, postId, parentCommentId || null]
    );

    await checkAchievements(req.user.id, 'first_comment');
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Comment Error:', error);
    res.status(500).json({ error: 'Eroare la trimiterea analizei pe teren.' });
  }
});

module.exports = router;