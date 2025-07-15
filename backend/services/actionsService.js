const { calculateUSDValues, DEFAULT_HIGHLIGHT_LIMITS, getEffectiveOutputCoin, getHighlightType } = require('../utils/usdUtils');
const { getSettings } = require('./settingsService');
const trimAsset = require('../utils/trimAsset');

const MAX_SWAPS = 50;
let swapBuffer = [];
let previousTxids = new Set();

function storeActions(actions, db) {
    getSettings((settings) => {
        for (const action of actions) {
            const txid = action.in?.[0]?.txID;
            if (txid) {
                db.get('SELECT notified FROM actions WHERE txid = ?', [txid], (err, row) => {
                    const notified = row ? row.notified : 0;
                    // Calculate USD values
                    const inputCoin = action.in[0]?.coins[0];
                    const outputCoin = action.out[0]?.coins[0];
                    const swapMeta = action.metadata?.swap;
                    const effectiveOutputCoin = getEffectiveOutputCoin(outputCoin, action, swapMeta);
                    const { inputUsd, outputUsd } = calculateUSDValues(inputCoin, effectiveOutputCoin, swapMeta);
                    const maxUsd = Math.max(inputUsd, outputUsd);
                    const highlightType = getHighlightType(inputUsd, outputUsd, inputCoin?.asset, settings || DEFAULT_HIGHLIGHT_LIMITS);
                    // Check if this txid is new or updated
                    const isNew = !previousTxids.has(txid);
                    const actionWithMetadata = {
                        ...action,
                        _isNew: isNew,
                        _txid: txid,
                        inputUsd,
                        outputUsd,
                        maxUsd,
                        highlightType
                    };
                    db.run(
                        'INSERT OR REPLACE INTO actions (txid, data, notified) VALUES (?, ?, ?)',
                        [txid, JSON.stringify(actionWithMetadata), notified],
                        () => {
                            // After insert/update, enforce FIFO in DB
                            db.all('SELECT txid, data FROM actions', (err, rows) => {
                                if (rows && rows.length > MAX_SWAPS) {
                                    // Sort by date ascending (oldest first)
                                    rows.sort((a, b) => Number(JSON.parse(a.data).date) - Number(JSON.parse(b.data).date));
                                    const toDelete = rows.slice(0, rows.length - MAX_SWAPS);
                                    toDelete.forEach(row => {
                                        db.run('DELETE FROM actions WHERE txid = ?', row.txid);
                                        previousTxids.delete(row.txid);
                                    });
                                }
                            });
                        }
                    );
                    // Update buffer
                    if (isNew) {
                        swapBuffer.unshift(actionWithMetadata);
                        previousTxids.add(txid);
                    } else {
                        // Update existing action in buffer
                        const idx = swapBuffer.findIndex(a => a._txid === txid);
                        if (idx !== -1) swapBuffer[idx] = actionWithMetadata;
                    }
                    // Maintain FIFO in buffer
                    while (swapBuffer.length > MAX_SWAPS) {
                        const removed = swapBuffer.pop();
                        previousTxids.delete(removed._txid);
                    }
                });
            }
        }
    });
}

function getActions(db, cb) {
    db.all('SELECT * FROM actions ORDER BY rowid DESC LIMIT 50', (err, rows) => {
        if (err) return cb(err);
        const actions = rows.map(row => {
            const action = JSON.parse(row.data);
            // Trim asset strings for all coins in 'in' and 'out'
            if (action.in) {
                action.in.forEach(input => {
                    if (input.coins) {
                        input.coins.forEach(coin => {
                            coin.asset = trimAsset(coin.asset);
                        });
                    }
                });
            }
            if (action.out) {
                action.out.forEach(output => {
                    if (output.coins) {
                        output.coins.forEach(coin => {
                            coin.asset = trimAsset(coin.asset);
                        });
                    }
                });
            }
            return action;
        });
        cb(null, actions);
    });
}

function getUnnotifiedActions(db, cb) {
    db.all('SELECT * FROM actions WHERE notified = 0', (err, rows) => {
        if (err) return cb([]);
        cb(rows);
    });
}

module.exports = { storeActions, getActions, getUnnotifiedActions }; 