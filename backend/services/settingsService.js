const db = require('../db');

// Ensure settings table exists
function initSettingsTable() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      greenRed INTEGER DEFAULT 10000,
      blueYellow INTEGER DEFAULT 5000,
      pollingInterval INTEGER DEFAULT 30
    )`);
        db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
            if (!row) {
                db.run('INSERT INTO settings (id, greenRed, blueYellow, pollingInterval) VALUES (1, 10000, 5000, 30)');
            }
        });
    });
}

function getSettings(cb) {
    db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
        if (err || !row) {
            // Insert default row if missing
            db.run('INSERT OR IGNORE INTO settings (id, greenRed, blueYellow, pollingInterval) VALUES (1, 10000, 5000, 30)', () => {
                cb({ greenRed: 10000, blueYellow: 5000, pollingInterval: 30 });
            });
        } else {
            cb({
                greenRed: row.greenRed,
                blueYellow: row.blueYellow,
                pollingInterval: row.pollingInterval
            });
        }
    });
}

function setSettings({ greenRed, blueYellow, pollingInterval }, cb) {
    db.run(
        'UPDATE settings SET greenRed = ?, blueYellow = ?, pollingInterval = ? WHERE id = 1',
        [greenRed, blueYellow, pollingInterval],
        cb
    );
}

module.exports = { initSettingsTable, getSettings, setSettings }; 