import type { Coin, SwapMetadata, Action } from '../types/swap';

export function trimAsset(asset: string) {
  const [first, second] = asset.split(/[-.]/);
  return `${first}.${second}`;
}

export function calculateUSDValues(
  inputCoin: Coin | undefined,
  outputCoin: Coin | undefined,
  swapMeta: SwapMetadata | undefined
): { inputUsd: number; outputUsd: number } {
  const inputUsd = inputCoin && swapMeta && swapMeta.inPriceUSD
    ? (parseInt(inputCoin.amount) / 100000000 * parseFloat(swapMeta.inPriceUSD))
    : 0;
  const outputUsd = outputCoin && swapMeta && swapMeta.outPriceUSD
    ? (parseInt(outputCoin.amount) / 100000000 * parseFloat(swapMeta.outPriceUSD))
    : 0;
  return { inputUsd, outputUsd };
}

export function getEffectiveOutputCoin(outputCoin: Coin | undefined, action: Action, swapMeta: SwapMetadata | undefined): Coin | undefined {
  // Create virtual output coin for pending swaps
  if (action.status === 'pending' && swapMeta?.streamingSwapMeta?.outEstimation) {
    return {
      amount: swapMeta.streamingSwapMeta.outEstimation,
      asset: 'THOR.RUJI' // Assuming this is the target asset for pending swaps
    };
  }
  return outputCoin;
}

export function getSwapCalculations(inputCoin: Coin | undefined, effectiveOutputCoin: Coin | undefined, swapMeta: SwapMetadata | undefined, limits: HighlightLimits) {
  const { inputUsd, outputUsd } = calculateUSDValues(inputCoin, effectiveOutputCoin, swapMeta);
  const { style: highlightStyle, type: highlightType = undefined } = getHighlightStyle(inputUsd, outputUsd, inputCoin?.asset, limits);
  const maxUsd = Math.max(inputUsd, outputUsd);

  return { highlightStyle, highlightType, maxUsd };
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

// Default highlight limits for whale and dolphin detection
export const DEFAULT_HIGHLIGHT_LIMITS: HighlightLimits = {
  greenRed: 10000,    // Whale threshold
  blueYellow: 5000   // Dolphin threshold
};

export function getHighlightStyle(
  inputUsd: number,
  outputUsd: number,
  inputAsset?: string,
  limits: HighlightLimits = DEFAULT_HIGHLIGHT_LIMITS
): { style: Record<string, any>; type: 'blue' | 'green' | 'yellow' | 'red' | undefined } {
  const isRuji = inputAsset === 'THOR.RUJI';
  if (inputUsd > limits.greenRed || outputUsd > limits.greenRed) {
    return isRuji
      ? { style: { backgroundColor: '#ffeaea', border: '2px solid #f44336' }, type: 'red' }
      : { style: { backgroundColor: '#e6f9e6', border: '2px solid #4caf50' }, type: 'green' };
  } else if (inputUsd > limits.blueYellow || outputUsd > limits.blueYellow) {
    return isRuji
      ? { style: { backgroundColor: '#fffde7', border: '2px solid #ffd600' }, type: 'yellow' }
      : { style: { backgroundColor: '#e3f2fd', border: '2px solid #1976d2' }, type: 'blue' };
  } else {
    return { style: { border: '1px solid #e0e0e0' }, type: undefined };
  }
} 