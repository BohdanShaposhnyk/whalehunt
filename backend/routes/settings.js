const express = require('express');
const router = express.Router();
const { getSettings, setSettings } = require('../services/settingsService');

router.get('/', (req, res) => {
    getSettings((settings) => res.json(settings));
});

router.post('/', (req, res) => {
    const { greenRed, blueYellow, pollingInterval } = req.body;
    setSettings({ greenRed, blueYellow, pollingInterval }, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save settings' });
        res.json({ success: true });
    });
});

module.exports = router; 