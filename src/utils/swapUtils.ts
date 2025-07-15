import type { Coin } from '../types/swap';

export function trimAsset(asset: string) {
  const [first, second] = asset.split(/[-.]/);
  return `${first}.${second}`;
}

export function getRujiDirection(inputCoin: Coin | undefined, outputCoin: Coin | undefined): 'input' | 'output' | null {
  if (inputCoin && trimAsset(inputCoin.asset) === 'THOR.RUJI') {
    return 'input';
  } else if (outputCoin && trimAsset(outputCoin.asset) === 'THOR.RUJI') {
    return 'output';
  }
  return null;
}

export interface HighlightLimits {
  greenRed: number;
  blueYellow: number;
} 