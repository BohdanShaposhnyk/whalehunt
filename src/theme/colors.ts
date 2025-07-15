// Centralized theme colors
export const themeColors = {
    // Primary background colors
    primary: '#4F6F52',    // Main background (ActionsList)
    secondary: '#3A4D39',  // Secondary background
    accent: '#ECE3CE',     // Settings panel background
    accent2: '#739072',    // Audio panel background

    // Text colors
    textPrimary: '#222',
    textSecondary: '#666',

    // Border colors
    border: '#ccc',
    borderLight: '#e0e0e0',

    // Highlight colors (for swap types)
    blue: '#1976d2',
    green: '#4caf50',
    yellow: '#ffd600',
    red: '#f44336',

    // Hover states
    blueHover: '#1565c0',
    greenHover: '#388e3c',
    yellowHover: '#ffb300',
    redHover: '#d32f2f',

    // Background variations
    cardBackground: '#EEE',
    panelBackground: '#f5f5f5',
} as const;

export type ThemeColors = typeof themeColors; 