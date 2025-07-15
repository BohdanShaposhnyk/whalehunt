const axios = require('axios');
const { storeActions } = require('./actionsService');
const { getSettings } = require('./settingsService');
const { getTelegramConfig } = require('./telegramService');
const { getEffectiveOutputCoin, selectOutputCoin } = require('../utils/usdUtils');

const VANAHEIMEX_API = 'https://vanaheimex.com/actions?limit=10&asset=THOR.RUJI&type=swap';

let schedulerInterval = null;

function startScheduler(db) {
    if (schedulerInterval) clearInterval(schedulerInterval);
    // Use a default interval, will update on first settings fetch
    let intervalMs = 30000;
    schedulerInterval = setInterval(async () => {
        // Fetch latest settings every interval
        getSettings((settings) => {
            intervalMs = Math.max(5, settings.pollingInterval) * 1000;
            // 1. Fetch and store latest actions
            (async () => {
                try {
                    const { data } = await axios.get(VANAHEIMEX_API);
                    const actions = Array.isArray(data) ? data : data.actions || data.data || [];
                    storeActions(actions, db);
                } catch (err) {
                    // Ignore fetch errors
                }
                // 2. Notify for unnotified whale actions
                db.all('SELECT * FROM actions WHERE notified = 0', (err, rows) => {
                    if (err) return;
                    getTelegramConfig(async (config) => {
                        if (!config.enabled || !config.botToken || !config.chatId) return;
                        for (const row of rows) {
                            const action = JSON.parse(row.data);
                            const inputAmount = parseInt(action.in[0]?.coins[0]?.amount || '0') / 1e8;
                            // Use selectOutputCoin for correct output coin selection
                            const outputCoin = selectOutputCoin(action);
                            const swapMeta = action.metadata?.swap;
                            const effectiveOutputCoin = getEffectiveOutputCoin(outputCoin, action, swapMeta);
                            const outputAmount = effectiveOutputCoin ? parseInt(effectiveOutputCoin.amount) / 1e8 : 0;
                            const outputAsset = effectiveOutputCoin ? effectiveOutputCoin.asset : (outputCoin ? outputCoin.asset : '');
                            if (inputAmount > settings.greenRed) { // Whale threshold from settings
                                const msg = `🐋 Whale Detected!\n${inputAmount} ${action.in[0]?.coins[0]?.asset} -> ${outputAmount} ${outputAsset}`;
                                try {
                                    await axios.post(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
                                        chat_id: config.chatId,
                                        text: msg,
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true
                                    });
                                    db.run('UPDATE actions SET notified = 1 WHERE txid = ?', row.txid);
                                } catch (e) {
                                    // Ignore send errors
                                }
                            } else {
                                db.run('UPDATE actions SET notified = 1 WHERE txid = ?', row.txid);
                            }
                        }
                    });
                });
            })();
        });
    }, intervalMs);
}

module.exports = { startScheduler }; 