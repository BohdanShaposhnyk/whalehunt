const db = require('../db');
const TelegramBot = require('node-telegram-bot-api');

// Ensure telegram_config table exists
function initTelegramConfigTable() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS telegram_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      botToken TEXT,
      chatId TEXT,
      enabled INTEGER DEFAULT 0
    )`);
        db.get('SELECT * FROM telegram_config WHERE id = 1', (err, row) => {
            if (!row) {
                db.run('INSERT INTO telegram_config (id, botToken, chatId, enabled) VALUES (1, "", "", 0)');
            }
        });
    });
}

function getTelegramConfig(cb) {
    db.get('SELECT * FROM telegram_config WHERE id = 1', (err, row) => {
        if (err) return cb({ botToken: '', chatId: '', enabled: false });
        cb({
            botToken: row.botToken || '',
            chatId: row.chatId || '',
            enabled: !!row.enabled
        });
    });
}

function setTelegramConfig({ botToken, chatId, enabled }, cb) {
    db.run(
        'UPDATE telegram_config SET botToken = ?, chatId = ?, enabled = ? WHERE id = 1',
        [botToken || '', chatId || '', enabled ? 1 : 0],
        cb
    );
}

function createBot(token) {
    return new TelegramBot(token, { polling: false });
}

module.exports = { initTelegramConfigTable, getTelegramConfig, setTelegramConfig, createBot }; 