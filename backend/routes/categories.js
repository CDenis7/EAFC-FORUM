const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT c.*, 
            (SELECT COUNT(*) FROM posts WHERE category_id = c.id)::int as post_count
            FROM categories c 
            ORDER BY c.name ASC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const catRes = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
        if (catRes.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });

        const postsRes = await db.query(`
            SELECT p.*, u.username as author,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id)::int as comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.category_id = $1
            ORDER BY p.created_at DESC
        `, [req.params.id]);

        res.json({
            category: catRes.rows[0],
            posts: postsRes.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category posts.' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
    const { name, description, icon } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) RETURNING *',
            [name, description, icon || '💬']
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Creation failed.' });
    }
});

module.exports = router;