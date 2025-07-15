interface TelegramConfig {
    botToken: string;
    chatId: string;
    enabled: boolean;
}

interface TelegramMessage {
    text: string;
    parse_mode?: 'HTML' | 'Markdown';
    disable_web_page_preview?: boolean;
}

const STORAGE_KEY = 'telegramConfig';

// Load config from localStorage or use defaults
const loadConfig = (): TelegramConfig => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Failed to load Telegram config from localStorage:', error);
    }

    return {
        botToken: '',
        chatId: '',
        enabled: false
    };
};

// Save config to localStorage
const saveConfig = (config: TelegramConfig): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
        console.warn('Failed to save Telegram config to localStorage:', error);
    }
};

// Initialize with loaded config
let telegramConfig: TelegramConfig = loadConfig();

export const setTelegramConfig = (config: Partial<TelegramConfig>) => {
    telegramConfig = { ...telegramConfig, ...config };
    saveConfig(telegramConfig);
};

export const getTelegramConfig = (): TelegramConfig => {
    return { ...telegramConfig };
};

export const sendTelegramMessage = async (message: TelegramMessage): Promise<boolean> => {
    if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) {
        console.warn('Telegram notifications not configured');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: telegramConfig.chatId,
                text: message.text,
                parse_mode: message.parse_mode || 'HTML',
                disable_web_page_preview: message.disable_web_page_preview || true,
            }),
        });

        const result = await response.json();

        if (result.ok) {
            console.log('Telegram message sent successfully');
            return true;
        } else {
            console.error('Failed to send Telegram message:', result);
            return false;
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return false;
    }
};

export const sendWhaleAlert = async (
    highlightType: 'green' | 'red',
    inputAmount: number,
    inputAsset: string,
    outputAmount: number,
    outputAsset: string,
    maxUsd: number
): Promise<boolean> => {
    const emoji = highlightType === 'green' ? '🐋' : '🦈';
    const whaleType = highlightType === 'green' ? 'Whale' : 'RUJI Whale';

    const message = `
${emoji} <b>${whaleType} Detected!</b>

💰 <b>Swap Details:</b>
${inputAmount} ${inputAsset} → ${outputAmount} ${outputAsset}
💵 <b>Value:</b> $${maxUsd.toLocaleString()}

⏰ <b>Time:</b> ${new Date().toLocaleString()}
    `.trim();

    return await sendTelegramMessage({
        text: message,
        parse_mode: 'HTML'
    });
};

export const testTelegramConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
        return {
            success: false,
            message: 'Bot token and chat ID must be configured'
        };
    }

    try {
        const url = `https://api.telegram.org/bot${telegramConfig.botToken}/getMe`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.ok) {
            return {
                success: true,
                message: `Bot connected successfully: ${result.result.first_name} (@${result.result.username})`
            };
        } else {
            return {
                success: false,
                message: `Bot connection failed: ${result.description}`
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}; 