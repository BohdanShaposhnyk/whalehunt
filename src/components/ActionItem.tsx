import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import LaunchIcon from '@mui/icons-material/Launch';
import { useEffect } from 'react';
import { trimAsset, calculateUSDValues, getEffectiveOutputCoin, getSwapCalculations, getRujiDirection } from '../utils/swapUtils';
import { playBeepBlue, playBeepGreen, playBeepYellow, playBeepRed } from '../utils/audioUtils';
import { showNotification } from '../utils/notificationUtils';
import { sendWhaleAlert } from '../utils/telegramUtils';
import type { Coin, SwapMetadata, Action } from '../types/swap';
import type { HighlightLimits } from '../utils/swapUtils';
import { themeColors } from '../theme/colors';

interface ActionItemProps {
    action: Action;
    limits: HighlightLimits;
    isNew: boolean;
}

function renderSwapLine(inputCoin: Coin | undefined, outputCoin: Coin | undefined, swapMeta: SwapMetadata | undefined) {
    if (!inputCoin || !swapMeta) return null;

    const { inputUsd, outputUsd } = calculateUSDValues(inputCoin, outputCoin, swapMeta);
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

const ActionItem = ({ action, limits, isNew }: ActionItemProps) => {
    const inputCoin = action.in[0]?.coins[0];
    const outputCoin = action.out[0]?.coins[0];
    const swapMeta = action.metadata?.swap;
    const txid = action.in[0]?.txID;

    const effectiveOutputCoin = getEffectiveOutputCoin(outputCoin, action, swapMeta);
    const { highlightStyle, highlightType, maxUsd } = getSwapCalculations(inputCoin, effectiveOutputCoin, swapMeta, limits);
    const rujiDirection = getRujiDirection(inputCoin, outputCoin);

    useEffect(() => {
        if (highlightType && isNew) {
            // Play sound for highlight type
            if (highlightType === 'blue') playBeepBlue();
            if (highlightType === 'green') playBeepGreen();
            if (highlightType === 'yellow') playBeepYellow();
            if (highlightType === 'red') playBeepRed();

            // Show notification for whales (green/red)
            if (highlightType === 'green' || highlightType === 'red') {
                const inputAmount = inputCoin ? parseInt(inputCoin.amount) / 100000000 : 0;
                const outputAmount = effectiveOutputCoin ? parseInt(effectiveOutputCoin.amount) / 100000000 : 0;

                // Send desktop notification
                showNotification({
                    title: `🐋 ${highlightType === 'green' ? 'Whale' : 'RUJI Whale'} Detected!`,
                    body: `${inputAmount} ${trimAsset(inputCoin?.asset || '')} → ${outputAmount} ${trimAsset(effectiveOutputCoin?.asset || '')} ($${maxUsd.toLocaleString()})`,
                    silent: false
                });

                // Send Telegram notification
                sendWhaleAlert(
                    highlightType,
                    inputAmount,
                    trimAsset(inputCoin?.asset || ''),
                    outputAmount,
                    trimAsset(effectiveOutputCoin?.asset || ''),
                    maxUsd
                );
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightType, isNew]);

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
                ...highlightStyle
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
            {renderUsdCorner(maxUsd, rujiDirection)}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {(() => {
                    const ns = Number(action.date);
                    const ms = Math.floor(ns / 1_000_000);
                    return new Date(ms).toLocaleString();
                })()}
            </Typography>
            {renderSwapLine(inputCoin, effectiveOutputCoin, swapMeta)}
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