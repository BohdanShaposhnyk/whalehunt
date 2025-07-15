import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { playBeepBlue, playBeepGreen, playBeepYellow, playBeepRed } from '../utils/audioUtils';
import { themeColors } from '../theme/colors';

const AudioTestPanel: React.FC = () => {
    return (
        <Box
            sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                borderRadius: 1,
                background: themeColors.accent2,
                p: 1.5,
                boxSizing: 'border-box',
            }}
        >
            <Typography variant="h6" color="text.secondary" gutterBottom>
                Audio Test
            </Typography>
            <Box display="flex" gap={1} justifyContent="center">
                <Button
                    variant="contained"
                    onClick={playBeepBlue}
                    sx={{
                        bgcolor: themeColors.blue,
                        '&:hover': { bgcolor: themeColors.blueHover },
                        minWidth: 60,
                        fontSize: '0.8rem',
                        py: 0.5,
                    }}
                >
                    Blue
                </Button>
                <Button
                    variant="contained"
                    onClick={playBeepGreen}
                    sx={{
                        bgcolor: themeColors.green,
                        '&:hover': { bgcolor: themeColors.greenHover },
                        minWidth: 60,
                        fontSize: '0.8rem',
                        py: 0.5,
                    }}
                >
                    Green
                </Button>
                <Button
                    variant="contained"
                    onClick={playBeepYellow}
                    sx={{
                        bgcolor: themeColors.yellow,
                        color: themeColors.textPrimary,
                        '&:hover': { bgcolor: themeColors.yellowHover },
                        minWidth: 60,
                        fontSize: '0.8rem',
                        py: 0.5,
                    }}
                >
                    Yellow
                </Button>
                <Button
                    variant="contained"
                    onClick={playBeepRed}
                    sx={{
                        bgcolor: themeColors.red,
                        '&:hover': { bgcolor: themeColors.redHover },
                        minWidth: 60,
                        fontSize: '0.8rem',
                        py: 0.5,
                    }}
                >
                    Red
                </Button>
            </Box>
        </Box>
    );
};

export default AudioTestPanel; 