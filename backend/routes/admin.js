const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).json({ error: 'Admin only access.' });
};

router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
    try {
        const users = await db.query('SELECT COUNT(*) FROM users');
        const posts = await db.query('SELECT COUNT(*) FROM posts');
        const categories = await db.query('SELECT COUNT(*) FROM categories');
        res.json({
            totalUsers: parseInt(users.rows[0].count),
            totalPosts: parseInt(posts.rows[0].count),
            totalCategories: parseInt(categories.rows[0].count)
        });
    } catch (error) {
        res.status(500).json({ error: 'Stats failed.' });
    }
});

router.get('/users', authMiddleware, adminOnly, async (req, res) => {
    const { rows } = await db.query('SELECT id, username, email, role, created_at FROM users');
    res.json(rows);
});

module.exports = router;