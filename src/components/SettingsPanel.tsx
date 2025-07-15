import React from 'react';
import Box from '@mui/material/Box';
import { useDispatch, useSelector } from 'react-redux';
import HighlightSettings from './HighlightSettings';
import RefreshSettings from './RefreshSettings';
import type { RootState } from '../store';
import { setRefreshTime, setHighlightLimits } from '../store';
import { themeColors } from '../theme/colors';

const SettingsPanel: React.FC = () => {
    const dispatch = useDispatch();
    const refreshTime = useSelector((state: RootState) => state.refreshTime.value);
    const highlightLimits = useSelector((state: RootState) => state.highlightLimits.value);

    const handleRefreshTimeChange = (time: number) => {
        dispatch(setRefreshTime(time));
    };

    const handleHighlightLimitsChange = (limits: any) => {
        dispatch(setHighlightLimits(limits));
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
            <HighlightSettings limits={highlightLimits} onChange={handleHighlightLimitsChange} />
            <RefreshSettings refreshTime={refreshTime} onRefreshTimeChange={handleRefreshTimeChange} />
        </Box>
    );
};

export default SettingsPanel; 