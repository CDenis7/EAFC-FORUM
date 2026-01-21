const db = require('../db');

async function checkAchievements(userId, type) {
    try {
        let count = 0;
        if (type === 'first_post' || type === 'post_count') {
            const res = await db.query('SELECT COUNT(*) FROM posts WHERE user_id = $1', [userId]);
            count = parseInt(res.rows[0].count, 10);
        } else if (type === 'first_comment' || type === 'comment_count') {
            const res = await db.query('SELECT COUNT(*) FROM comments WHERE user_id = $1', [userId]);
            count = parseInt(res.rows[0].count, 10);
        }

        const trigger = type.includes('post') ? (count === 1 ? 'first_post' : 'post_count') : (count === 1 ? 'first_comment' : 'comment_count');

        const eligibleQuery = `
            SELECT id FROM achievements 
            WHERE requirement_type = $1 AND requirement_value <= $2
            AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = $3)
        `;

        const { rows: eligible } = await db.query(eligibleQuery, [trigger, count, userId]);

        for (const ach of eligible) {
            await db.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, ach.id]);
        }
    } catch (error) {
        console.error('Achievement error:', error);
    }
}

module.exports = { checkAchievements };