const express = require('express');
const cors = require('cors');
const db = require('./db');
const actionsRoutes = require('./routes/actions')(db);
const settingsRoutes = require('./routes/settings');
const telegramRoutes = require('./routes/telegram');
const { initSettingsTable } = require('./services/settingsService');
const { initTelegramConfigTable } = require('./services/telegramService');
const { startScheduler } = require('./services/schedulerService');

const app = express();
app.set('etag', false);
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// === DATABASE TABLES (actions) ===
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS actions (
    txid TEXT PRIMARY KEY,
    data TEXT,
    notified INTEGER DEFAULT 0
  )`);
});

// === INIT SETTINGS & TELEGRAM TABLES ===
initSettingsTable();
initTelegramConfigTable();

// === START SCHEDULER ===
startScheduler(db);

// === ROUTES ===
app.use('/api/actions', actionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/telegram', telegramRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
}); 