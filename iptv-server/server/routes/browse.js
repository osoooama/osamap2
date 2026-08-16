const express = require('express');
const router = express.Router();
const { getDb } = require('../db/sqlite');

router.get('/categories', (req, res) => {
    try {
        const db = getDb();
        const cats = db.prepare('SELECT category_id, name, type, is_hidden, source_id FROM categories WHERE type = ? AND is_hidden = 0 ORDER BY name').all('live');
        const items = db.prepare('SELECT category_id, source_id, type FROM playlist_items WHERE type = ? AND is_hidden = 0').all('live');
        const countMap = {};
        for (const item of items) {
            const key = `${item.source_id}:${item.category_id}:${item.type}`;
            countMap[key] = (countMap[key] || 0) + 1;
        }
        const result = cats.map(c => ({
            category_id: c.category_id,
            name: c.name,
            type: c.type,
            is_hidden: c.is_hidden,
            channel_count: countMap[`${c.source_id}:${c.category_id}:${c.type}`] || 0
        }));
        res.json(result);
    } catch (err) {
        console.error('Error getting categories:', err);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

router.get('/category/:categoryId', (req, res) => {
    try {
        const db = getDb();
        const { categoryId } = req.params;
        const channels = db.prepare('SELECT item_id, name, stream_icon, stream_url, source_id, category_id, data FROM playlist_items WHERE category_id = ? AND type = ? AND is_hidden = 0 ORDER BY name').all(categoryId, 'live');
        res.json(channels);
    } catch (err) {
        console.error('Error getting channels:', err);
        res.status(500).json({ error: 'Failed to get channels' });
    }
});

router.get('/all', (req, res) => {
    try {
        const db = getDb();
        const channels = db.prepare('SELECT item_id, name, stream_icon, stream_url, source_id, category_id, data FROM playlist_items WHERE type = ? AND is_hidden = 0 ORDER BY name').all('live');
        res.json(channels);
    } catch (err) {
        console.error('Error getting all channels:', err);
        res.status(500).json({ error: 'Failed to get channels' });
    }
});

router.get('/search', (req, res) => {
    try {
        const db = getDb();
        const q = req.query.q || '';
        if (!q.trim()) return res.json([]);
        const channels = db.prepare('SELECT item_id, name, stream_icon, stream_url, source_id, category_id, data FROM playlist_items WHERE type = ? AND is_hidden = 0 AND name LIKE ? ORDER BY name LIMIT 100').all('live', `%${q}%`);
        res.json(channels);
    } catch (err) {
        console.error('Error searching channels:', err);
        res.status(500).json({ error: 'Failed to search channels' });
    }
});

module.exports = router;
