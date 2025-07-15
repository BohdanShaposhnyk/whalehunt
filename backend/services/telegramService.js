const db = require('../db');
const TelegramBot = require('node-telegram-bot-api');
const { setSettings, getSettings } = require('./settingsService');

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

function startBotWithCommands(token) {
    const bot = new TelegramBot(token, { polling: true });

    bot.onText(/\/set_whale (\d+)/, (msg, match) => {
        const value = parseInt(match[1]);
        getSettings((settings) => {
            setSettings({ ...settings, greenRed: value }, () => {
                bot.sendMessage(msg.chat.id, `Whale limit set to $${value}`);
            });
        });
    });

    bot.onText(/\/set_dolphin (\d+)/, (msg, match) => {
        const value = parseInt(match[1]);
        getSettings((settings) => {
            setSettings({ ...settings, blueYellow: value }, () => {
                bot.sendMessage(msg.chat.id, `Dolphin limit set to $${value}`);
            });
        });
    });

    bot.onText(/\/set_refresh (\d+)/, (msg, match) => {
        const value = parseInt(match[1]);
        getSettings((settings) => {
            setSettings({ ...settings, pollingInterval: value }, () => {
                bot.sendMessage(msg.chat.id, `Refresh time set to ${value} seconds`);
            });
        });
    });

    bot.onText(/\/get_settings/, (msg) => {
        getSettings((settings) => {
            bot.sendMessage(
                msg.chat.id,
                `Current settings:\nWhale: $${settings.greenRed}\nDolphin: $${settings.blueYellow}\nRefresh: ${settings.pollingInterval} sec`
            );
        });
    });

    bot.onText(/\/help/, (msg) => {
        bot.sendMessage(
            msg.chat.id,
            `Available commands:\n/set_whale <amount> - Set whale limit\n/set_dolphin <amount> - Set dolphin limit\n/set_refresh <seconds> - Set refresh time\n/get_settings - Show current settings`
        );
    });

    return bot;
}

module.exports = { initTelegramConfigTable, getTelegramConfig, setTelegramConfig, createBot, startBotWithCommands }; 