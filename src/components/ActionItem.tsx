import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import LaunchIcon from '@mui/icons-material/Launch';
import { useEffect } from 'react';
import { trimAsset, getRujiDirection } from '../utils/swapUtils';
import { playBeepBlue, playBeepGreen, playBeepYellow, playBeepRed } from '../utils/audioUtils';
import type { Coin, Action } from '../types/swap';
import { themeColors } from '../theme/colors';

interface ActionItemProps {
    action: Action;
    isNew: boolean;
}

function renderSwapLine(inputCoin: Coin | undefined, outputCoin: Coin | undefined, inputUsd: number, outputUsd: number) {
    if (!inputCoin) return null;
    const inputAmount = parseInt(inputCoin.amount) / 100000000;
    if (!outputCoin) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {inputAmount} <strong>{trimAsset(inputCoin.asset)}</strong> (${inputUsd.toFixed(2)}) → ...
            </Typography>
        );
    }
    const outputAmount = parseInt(outputCoin.amount) / 100000000;
    return (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {inputAmount} <strong>{trimAsset(inputCoin.asset)}</strong> (${inputUsd.toFixed(2)})
            {' '}→{' '}
            {outputAmount} <strong>{trimAsset(outputCoin.asset)}</strong> (${outputUsd.toFixed(2)})
        </Typography>
    );
}

function renderUsdCorner(outputUsd: number, rujiDirection: 'input' | 'output' | null) {
    if (outputUsd <= 0) return null;
    return (
        <Box sx={{ position: 'absolute', bottom: 10, right: 16, display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#444', mr: 1 }}>
                ${outputUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
            {rujiDirection === 'input' ? (
                <span style={{ color: '#f44336', fontSize: 20, fontWeight: 500 }}>↓</span>
            ) : rujiDirection === 'output' ? (
                <span style={{ color: '#388e3c', fontSize: 20, fontWeight: 500 }}>↑</span>
            ) : null}
        </Box>
    );
}

// Remove highlightStyle usage, add a function to map highlightType to style
function getHighlightStyle(type: 'none' | 'blue' | 'green' | 'yellow' | 'red' | undefined) {
    switch (type) {
        case 'green':
            return { backgroundColor: '#e6f9e6', border: '2px solid #4caf50' };
        case 'red':
            return { backgroundColor: '#ffeaea', border: '2px solid #f44336' };
        case 'blue':
            return { backgroundColor: '#e3f2fd', border: '2px solid #1976d2' };
        case 'yellow':
            return { backgroundColor: '#fffde7', border: '2px solid #ffd600' };
        default:
            return { border: '1px solid #e0e0e0' };
    }
}

const ActionItem = ({ action, isNew }: ActionItemProps) => {
    const inputCoin = action.in[0]?.coins[0];
    const outputCoin = action.out[0]?.coins[0];
    const txid = action.in[0]?.txID;
    const maxUsd = action.maxUsd ?? 0;
    const inputUsd = action.inputUsd ?? 0;
    const outputUsd = action.outputUsd ?? 0;
    const rujiDirection = getRujiDirection(inputCoin, outputCoin);
    // highlightType and highlightStyle logic can be kept if it depends on more than just USD values, otherwise refactor as needed
    useEffect(() => {
        if (action.highlightType && isNew) {
            // Play sound for highlight type
            if (action.highlightType === 'blue') playBeepBlue();
            if (action.highlightType === 'green') playBeepGreen();
            if (action.highlightType === 'yellow') playBeepYellow();
            if (action.highlightType === 'red') playBeepRed();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action.highlightType, isNew]);

    return (
        <Box
            bgcolor={themeColors.cardBackground}
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            justifyContent="center"
            sx={{
                mb: 1,
                p: 2,
                borderRadius: 1,
                position: 'relative',
                opacity: maxUsd < 100 ? 0.6 : 1,
                ...getHighlightStyle(action.highlightType)
            }}
        >
            {action.status === 'pending' && (
                <Box sx={{ position: 'absolute', top: 10, right: 16, zIndex: 1 }}>
                    <CircularProgress size={20} sx={{ color: '#1976d2' }} />
                </Box>
            )}
            {txid && (
                <Box sx={{ position: 'absolute', top: 10, right: action.status === 'pending' ? 50 : 16, zIndex: 1 }}>
                    <IconButton
                        size="small"
                        href={`https://thorchain.net/tx/${txid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: '#666',
                            '&:hover': { color: '#1976d2' },
                            p: 0.5
                        }}
                    >
                        <LaunchIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
            {renderUsdCorner(outputUsd, rujiDirection)}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {(() => {
                    const ns = Number(action.date);
                    const ms = Math.floor(ns / 1_000_000);
                    return new Date(ms).toLocaleString();
                })()}
            </Typography>
            {renderSwapLine(inputCoin, outputCoin, inputUsd, outputUsd)}
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                <span style={{ color: '#666', marginRight: 4 }}>Address:</span>
                <a
                    href={`https://thorchain.net/address/${action.in[0]?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1976d2', textDecoration: 'underline', wordBreak: 'break-all' }}
                >
                    {action.in[0]?.address}
                </a>
            </Typography>
        </Box>
    );
};

export default ActionItem; 