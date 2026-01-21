const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search term required.' });

    try {
        const postsQuery = `
            SELECT p.*, u.username as author, c.name as community_name 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN communities c ON p.community_id = c.id
            WHERE p.title ILIKE $1 OR p.content ILIKE $1
            LIMIT 10
        `;
        
        const guildsQuery = `
            SELECT * FROM communities 
            WHERE name ILIKE $1 OR description ILIKE $1
            LIMIT 5
        `;

        const [postsRes, guildsRes] = await Promise.all([
            db.query(postsQuery, [`%${q}%`]),
            db.query(guildsQuery, [`%${q}%`])
        ]);

        res.json({
            quests: postsRes.rows,
            guilds: guildsRes.rows
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search system offline.' });
    }
});

module.exports = router;