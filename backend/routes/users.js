const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.put('/profile', authMiddleware, async (req, res) => {
    const { bio, avatar_url } = req.body;
    const userId = req.user.id;

    try {
        const query = `
            UPDATE users 
            SET bio = $1, avatar_url = $2 
            WHERE id = $3 
            RETURNING id, username, email, role, avatar_url, bio
        `;
        const { rows } = await db.query(query, [bio, avatar_url, userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ user: rows[0], message: 'Tactical adjustment complete.' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update squad records.' });
    }
});

router.get('/:username', async (req, res) => {
    try {
        const userRes = await db.query('SELECT id, username, role, avatar_url, bio, created_at FROM users WHERE username = $1', [req.params.username]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        const user = userRes.rows[0];

        const posts = await db.query(`
            SELECT p.*, c.name as category_name 
            FROM posts p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
        `, [user.id]);

        const achievements = await db.query(`
            SELECT a.name, a.description 
            FROM user_achievements ua 
            JOIN achievements a ON ua.achievement_id = a.id 
            WHERE ua.user_id = $1
        `, [user.id]);
        
        res.json({ user, posts: posts.rows, achievements: achievements.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load profile.' });
    }
});

module.exports = router;