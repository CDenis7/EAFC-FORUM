// File path: backend/routes/posts.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { checkAchievements } = require('../utils/achievementService');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

/**
 * GET /api/posts
 * Fetches the global thread feed.
 */
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.*, u.username AS author, c.name AS category_name, 
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int AS comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `;
        const { rows } = await db.query(query);
        res.json({ posts: rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch thread feed.' });
    }
});

/**
 * POST /api/posts
 * Creates a new thread in a specific category.
 */
router.post('/', authMiddleware, upload.array('files', 10), async (req, res) => {
    const { title, category_id, body } = req.body; // Changed from communityId
    if (!title || !category_id) return res.status(400).json({ error: 'Title and Category are required.' });

    try {
        const { rows } = await db.query(
            'INSERT INTO posts (title, content, user_id, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, body || '', req.user.id, category_id]
        );
        
        await checkAchievements(req.user.id, 'first_post');
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create thread.' });
    }
});

/**
 * GET /api/posts/:id
 * Thread details with nested replies.
 */
router.get('/:id', async (req, res) => {
    try {
        const postRes = await db.query(`
            SELECT p.*, u.username AS author, c.name AS category_name 
            FROM posts p JOIN users u ON p.user_id = u.id JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `, [req.params.id]);

        if (postRes.rows.length === 0) return res.status(404).json({ error: 'Thread not found.' });

        const comments = await db.query(`
            SELECT c.*, u.username as author FROM comments c 
            JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC
        `, [req.params.id]);
        
        const post = postRes.rows[0];
        post.comments = comments.rows;
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load thread.' });
    }
});

module.exports = router;