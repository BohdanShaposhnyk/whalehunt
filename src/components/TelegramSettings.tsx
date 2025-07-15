import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { getTelegramConfig, setTelegramConfig, testTelegramConnection } from '../utils/telegramUtils';
import { themeColors } from '../theme/colors';

const TelegramSettings: React.FC = () => {
    const [botToken, setBotToken] = useState('');
    const [chatId, setChatId] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        // Load current config
        const config = getTelegramConfig();
        setBotToken(config.botToken);
        setChatId(config.chatId);
        setEnabled(config.enabled);
    }, []);

    const handleSave = () => {
        setTelegramConfig({
            botToken,
            chatId,
            enabled
        });
        setTestResult({ success: true, message: 'Settings saved successfully!' });
    };

    const handleTest = async () => {
        setIsTesting(true);
        setTestResult(null);

        // Save current config first
        setTelegramConfig({
            botToken,
            chatId,
            enabled: true // Enable for testing
        });

        const result = await testTelegramConnection();
        setTestResult(result);
        setIsTesting(false);
    };

    return (
        <Box
            sx={{
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRadius: 1,
                background: themeColors.accent,
                p: 1.5,
                boxSizing: 'border-box',
            }}
        >
            <Typography variant="h6" sx={{ color: themeColors.textPrimary }}>
                Telegram Notifications
            </Typography>

            <FormControlLabel
                control={
                    <Switch
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        color="primary"
                    />
                }
                label="Enable Telegram notifications"
                sx={{ color: themeColors.textPrimary }}
            />

            <TextField
                label="Bot Token"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                size="small"
                type="password"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                helperText="Get this from @BotFather on Telegram"
                disabled={!enabled}
            />

            <TextField
                label="Chat ID"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                size="small"
                placeholder="123456789"
                helperText="Your personal chat ID or group chat ID"
                disabled={!enabled}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={handleSave}
                    disabled={!enabled || !botToken || !chatId}
                    size="small"
                >
                    Save Settings
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleTest}
                    disabled={!enabled || !botToken || !chatId || isTesting}
                    size="small"
                >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
            </Box>

            {testResult && (
                <Alert
                    severity={testResult.success ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                >
                    {testResult.message}
                </Alert>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                <strong>How to set up:</strong>
                <br />
                1. Message @BotFather on Telegram to create a new bot
                <br />
                2. Get your bot token and enter it above
                <br />
                3. Start a chat with your bot or add it to a group
                <br />
                4. Get your chat ID by messaging @userinfobot
                <br />
                5. Test the connection to verify everything works
            </Typography>
        </Box>
    );
};

export default TelegramSettings; 