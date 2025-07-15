import type { Coin } from '../types/swap';

// Removed trimAsset; assets are now trimmed in the backend

export function getRujiDirection(inputCoin: Coin | undefined, outputCoin: Coin | undefined): 'input' | 'output' | null {
  if (inputCoin && inputCoin.asset === 'THOR.RUJI') {
    return 'input';
  } else if (outputCoin && outputCoin.asset === 'THOR.RUJI') {
    return 'output';
  }
  return null;
}

export interface HighlightLimits {
  greenRed: number;
  blueYellow: number;
} 