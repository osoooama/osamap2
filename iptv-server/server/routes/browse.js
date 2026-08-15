const express = require('express');
const router = express.Router();
const { getDb } = require('../db/sqlite');

// Browse all categories with channel counts (for sidebar)
router.get('/categories', (req, res) => {
    try {
        const db = getDb();
        const categories = db.prepare(`
            SELECT category_id, name, type, is_hidden,
                   (SELECT COUNT(*) FROM playlist_items pi 
                    WHERE pi.source_id = c.source_id 
                    AND pi.category_id = c.category_id 
                    AND pi.type = c.type 
                    AND pi.is_hidden = 0) as channel_count
            FROM categories c
            WHERE type = 'live' AND is_hidden = 0
            ORDER BY name
        `).all();
        res.json(categories);
    } catch (err) {
        console.error('Error getting categories:', err);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

// Browse channels in a category
router.get('/category/:categoryId', (req, res) => {
    try {
        const db = getDb();
        const { categoryId } = req.params;
        const channels = db.prepare(`
            SELECT item_id, name, stream_icon, stream_url, source_id, category_id, data
            FROM playlist_items
            WHERE category_id = ? AND type = 'live' AND is_hidden = 0
            ORDER BY name
        `).all(categoryId);
        res.json(channels);
    } catch (err) {
        console.error('Error getting channels:', err);
        res.status(500).json({ error: 'Failed to get channels' });
    }
});

// Browse ALL channels (flat list)
router.get('/all', (req, res) => {
    try {
        const db = getDb();
        const channels = db.prepare(`
            SELECT item_id, name, stream_icon, stream_url, source_id, category_id, data
            FROM playlist_items
            WHERE type = 'live' AND is_hidden = 0
            ORDER BY name
        `).all();
        res.json(channels);
    } catch (err) {
        console.error('Error getting all channels:', err);
        res.status(500).json({ error: 'Failed to get channels' });
    }
});

// Search channels by name
router.get('/search', (req, res) => {
    try {
        const db = getDb();
        const q = req.query.q || '';
        if (!q.trim()) return res.json([]);
        const channels = db.prepare(`
            SELECT item_id, name, stream_icon, stream_url, source_id, category_id, data
            FROM playlist_items
            WHERE type = 'live' AND is_hidden = 0 AND name LIKE ?
            ORDER BY name
            LIMIT 100
        `).all(`%${q}%`);
        res.json(channels);
    } catch (err) {
        console.error('Error searching channels:', err);
        res.status(500).json({ error: 'Failed to search channels' });
    }
});

module.exports = router;
