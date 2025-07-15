import React from 'react';
import Box from '@mui/material/Box';
import HighlightSettings from './HighlightSettings';
import RefreshSettings from './RefreshSettings';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../store';
import { themeColors } from '../theme/colors';

const SettingsPanel: React.FC = () => {
    const { data: settings, isLoading, isError } = useGetSettingsQuery(undefined);
    const [updateSettings] = useUpdateSettingsMutation();

    const handleHighlightLimitsChange = async (limits: any) => {
        if (!settings) return;
        await updateSettings({
            greenRed: limits.greenRed,
            blueYellow: limits.blueYellow,
            pollingInterval: settings.pollingInterval
        });
    };

    const handleRefreshTimeChange = async (time: number) => {
        if (!settings) return;
        await updateSettings({
            greenRed: settings.greenRed,
            blueYellow: settings.blueYellow,
            pollingInterval: time
        });
    };

    return (
        <Box
            sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderRadius: 1,
                background: themeColors.accent,
                p: 1.5,
                boxSizing: 'border-box',
            }}
        >
            {isLoading ? (
                <div>Loading settings...</div>
            ) : isError ? (
                <div style={{ color: 'red' }}>Failed to load settings from backend</div>
            ) : settings ? (
                <>
                    <HighlightSettings limits={{ greenRed: settings.greenRed, blueYellow: settings.blueYellow }} onChange={handleHighlightLimitsChange} />
                    <RefreshSettings refreshTime={settings.pollingInterval} onRefreshTimeChange={handleRefreshTimeChange} />
                </>
            ) : null}
        </Box>
    );
};

export default SettingsPanel; 