const express = require('express');
const router = express.Router();
const { storeActions, getActions } = require('../services/actionsService');
const axios = require('axios');

// You may want to move VANAHEIMEX_API to a config file
const VANAHEIMEX_API = 'https://vanaheimex.com/actions?limit=10&asset=THOR.RUJI&type=swap';

module.exports = (db) => {
    // Fetch and store latest actions
    router.get('/fetch', async (req, res) => {
        try {
            const { data } = await axios.get(VANAHEIMEX_API);
            const actions = Array.isArray(data) ? data : data.actions || data.data || [];
            storeActions(actions, db);
            res.json({ success: true, count: actions.length });
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch actions' });
        }
    });

    // Get all stored actions
    router.get('/', (req, res) => {
        getActions(db, (err, actions) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            // Sort by date descending (newest first)
            actions.sort((a, b) => Number(b.date) - Number(a.date));
            res.json(actions);
        });
    });

    return router;
}; 