// File path: backend/routes/posts.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { checkAchievements } = require('../utils/achievementService');
const multer = require('multer');
const jwt = require('jsonwebtoken');

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
        console.error('Feed Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch thread feed.' });
    }
});

/**
 * POST /api/posts
 * Creates a new thread in a specific category.
 */
router.post('/', authMiddleware, upload.array('files', 10), async (req, res) => {
    const { title, category_id, body, content } = req.body; 
    
    if (!title || !category_id) return res.status(400).json({ error: 'Title and Category are required.' });

    const postContent = content || body || '';

    try {
        const { rows } = await db.query(
            'INSERT INTO posts (title, content, user_id, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, postContent, req.user.id, category_id]
        );
        
        await checkAchievements(req.user.id, 'first_post');
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Create Post Error:', error);
        res.status(500).json({ error: 'Failed to create thread.' });
    }
});

/**
 * GET /api/posts/:id
 * Thread details with nested replies.
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid Post ID.' });
    }

    let userId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (e) { }
    }

    try {
        const postRes = await db.query(`
            SELECT p.*, u.username AS author, c.name AS category_name, p.category_id, p.user_id,
            (SELECT value FROM votes WHERE user_id = $2 AND voteable_id = p.id AND voteable_type = 'post') as user_vote
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `, [id, userId]);

        if (postRes.rows.length === 0) return res.status(404).json({ error: 'Thread not found.' });

        const comments = await db.query(`
            SELECT c.*, u.username as author,
            (SELECT value FROM votes WHERE user_id = $2 AND voteable_id = c.id AND voteable_type = 'comment') as user_vote
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = $1 
            ORDER BY c.created_at ASC
        `, [id, userId]);
        
        const post = postRes.rows[0];
        post.user_vote = post.user_vote || 0;
        post.comments = comments.rows.map(c => ({...c, user_vote: c.user_vote || 0}));
        
        res.json(post);
    } catch (error) {
        console.error('Post Detail Error:', error);
        res.status(500).json({ error: 'Failed to load thread.' });
    }
});

/**
 * PUT /api/posts/:id
 * Updates a thread if the user is the author or admin.
 */
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, content, body } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: 'Invalid Post ID.' });
    
    // Normalize content
    const postContent = content || body;
    if (!title || !postContent) return res.status(400).json({ error: 'Title and content required.' });

    try {
        const checkRes = await db.query('SELECT user_id FROM posts WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) return res.status(404).json({ error: 'Thread not found.' });

        const post = checkRes.rows[0];
        if (post.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to edit this thread.' });
        }

        const { rows } = await db.query(
            'UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING *',
            [title, postContent, id]
        );
        res.json(rows[0]);

    } catch (error) {
        console.error('Update Post Error:', error);
        res.status(500).json({ error: 'Failed to update thread.' });
    }
});

/**
 * DELETE /api/posts/:id
 * Deletes a thread if the user is the author or admin.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid Post ID.' });
    }

    try {
        const postRes = await db.query('SELECT user_id FROM posts WHERE id = $1', [id]);
        
        if (postRes.rows.length === 0) {
            return res.status(404).json({ error: 'Thread not found.' });
        }

        const post = postRes.rows[0];

        if (post.user_id !== req.user.id && req.user.role !== 'admin') {
             return res.status(403).json({ error: 'Not authorized to delete this thread.' });
        }

        await db.query('DELETE FROM posts WHERE id = $1', [id]);
        res.json({ message: 'Thread deleted successfully.' });

    } catch (error) {
        console.error('Delete Post Error:', error);
        res.status(500).json({ error: 'Failed to delete thread.' });
    }
});

module.exports = router;