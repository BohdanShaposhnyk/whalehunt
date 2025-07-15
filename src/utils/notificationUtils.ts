// Notification utilities for Electron
declare global {
    interface Window {
        electronAPI?: {
            showNotification: (options: NotificationOptions) => Promise<boolean>;
        };
    }
}

interface NotificationOptions {
    title?: string;
    body?: string;
    icon?: string;
    silent?: boolean;
}

export const showNotification = async (options: NotificationOptions): Promise<boolean> => {
    // Check if we're in Electron
    if (window.electronAPI?.showNotification) {
        return await window.electronAPI.showNotification(options);
    }

    // Fallback to browser notifications
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(options.title || 'Whale Alert', {
            body: options.body,
            icon: options.icon,
            silent: options.silent
        });
        return true;
    }

    return false;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return Notification.permission === 'granted';
}; 