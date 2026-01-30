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

// Edit Comment
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'Content is required.' });

    try {
        const checkRes = await db.query('SELECT user_id FROM comments WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });
        
        if (checkRes.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        const { rows } = await db.query(
            'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
            [content, id]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error('Update Comment Error:', error);
        res.status(500).json({ error: 'Failed to update comment.' });
    }
});

// Delete Comment
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const checkRes = await db.query('SELECT user_id FROM comments WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });

        const isAuthor = checkRes.rows[0].user_id === req.user.id;
        // Allow admin (you can expand this logic as needed)
        const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized.' });
        }

        await db.query('DELETE FROM comments WHERE id = $1', [id]);
        res.json({ message: 'Comment deleted.' });
    } catch (error) {
        console.error('Delete Comment Error:', error);
        res.status(500).json({ error: 'Failed to delete comment.' });
    }
});

module.exports = router;