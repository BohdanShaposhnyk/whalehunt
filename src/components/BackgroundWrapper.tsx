import React from 'react';
import Box from '@mui/material/Box';
import { themeColors } from '../theme/colors';

const BackgroundWrapper: React.FC = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                minWidth: '100vw',
                bgcolor: themeColors.secondary,
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: -1,
            }}
        />
    );
};

export default BackgroundWrapper; 