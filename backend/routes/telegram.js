const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getTelegramConfig, setTelegramConfig, createBot } = require('../services/telegramService');

// GET /api/telegram/config
router.get('/config', (req, res) => {
    getTelegramConfig((config) => res.json(config));
});

// POST /api/telegram/config
router.post('/config', (req, res) => {
    const { botToken, chatId, enabled } = req.body;
    setTelegramConfig({ botToken, chatId, enabled }, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save config' });
        res.json({ success: true });
    });
});

// GET /api/telegram/test
router.get('/test', (req, res) => {
    getTelegramConfig(async (config) => {
        if (!config.botToken || !config.chatId) {
            return res.json({ success: false, message: 'Bot token and chat ID must be configured' });
        }
        try {
            const url = `https://api.telegram.org/bot${config.botToken}/getMe`;
            const response = await axios.get(url);
            const result = response.data;
            if (result.ok) {
                res.json({ success: true, message: `Bot connected successfully: ${result.result.first_name} (@${result.result.username})` });
            } else {
                res.json({ success: false, message: `Bot connection failed: ${result.description}` });
            }
        } catch (error) {
            res.json({ success: false, message: `Connection error: ${error.message}` });
        }
    });
});

// POST /api/telegram/whale-alert
router.post('/whale-alert', (req, res) => {
    getTelegramConfig(async (config) => {
        if (!config.enabled || !config.botToken || !config.chatId) {
            return res.status(400).json({ error: 'Telegram notifications not enabled/configured' });
        }
        const { highlightType, inputAmount, inputAsset, outputAmount, outputAsset, maxUsd } = req.body;
        const emoji = highlightType === 'green' ? '🐋' : '🦈';
        const whaleType = highlightType === 'green' ? 'Whale' : 'RUJI Whale';
        const message = `\n${emoji} <b>${whaleType} Detected!</b>\n\n💰 <b>Swap Details:</b>\n${inputAmount} ${inputAsset} → ${outputAmount} ${outputAsset}\n💵 <b>Value:</b> $${maxUsd.toLocaleString()}\n\n⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
        try {
            await axios.post(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
                chat_id: config.chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send Telegram message' });
        }
    });
});

// Add test whale endpoint
router.post('/test-whale', (req, res) => {
    getTelegramConfig(async (config) => {
        if (!config.enabled || !config.botToken || !config.chatId) {
            return res.status(400).json({ error: 'Telegram notifications not enabled/configured' });
        }
        const message = `🐋 <b>Test Whale Detected!</b>\n\n💰 <b>Swap Details:</b>\n1000 THOR.RUJI → 10 BTC.BTC\n💵 <b>Value:</b> $1,000,000\n\n⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
        try {
            await axios.post(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
                chat_id: config.chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send Telegram message' });
        }
    });
});

module.exports = router; 