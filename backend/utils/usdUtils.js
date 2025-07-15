function calculateUSDValues(inputCoin, outputCoin, swapMeta) {
    const inputUsd = inputCoin && swapMeta && swapMeta.inPriceUSD
        ? (parseInt(inputCoin.amount) / 100000000 * parseFloat(swapMeta.inPriceUSD))
        : 0;
    // For pending, use priceUsd if present on outputCoin
    const outputUsd = outputCoin && swapMeta && (outputCoin.priceUsd || swapMeta.outPriceUSD)
        ? (parseInt(outputCoin.amount) / 100000000 * parseFloat(outputCoin.priceUsd || swapMeta.outPriceUSD))
        : 0;
    return { inputUsd, outputUsd };
}

function getEffectiveOutputCoin(outputCoin, action, swapMeta) {
    // For pending swaps, synthesize output coin using pools[1], outEstimation, and outPriceUSD
    if (action.status === 'pending' && swapMeta && swapMeta.streamingSwapMeta && swapMeta.streamingSwapMeta.outEstimation && Array.isArray(action.pools) && action.pools.length > 1) {
        return {
            amount: swapMeta.streamingSwapMeta.outEstimation,
            asset: action.pools[1],
            priceUsd: swapMeta.outPriceUSD
        };
    }
    return outputCoin;
}

const DEFAULT_HIGHLIGHT_LIMITS = {
    greenRed: 10000,
    blueYellow: 5000
};

// Returns a string enum for highlightType: 'none', 'blue', 'green', 'yellow', 'red'
function getHighlightType(inputUsd, outputUsd, inputAsset, limits = DEFAULT_HIGHLIGHT_LIMITS) {
    const isRuji = inputAsset === 'THOR.RUJI';
    if (inputUsd > limits.greenRed || outputUsd > limits.greenRed) {
        return isRuji ? 'red' : 'green';
    } else if (inputUsd > limits.blueYellow || outputUsd > limits.blueYellow) {
        return isRuji ? 'yellow' : 'blue';
    } else {
        return 'none';
    }
}

// Selects the output coin based on pools if there are multiple output coins
function selectOutputCoin(action) {
    if (!action.out || !Array.isArray(action.out) || action.out.length === 0) {
        // For pending, synthesize output coin
        if (action.status === 'pending' && action.metadata && action.metadata.swap && action.metadata.swap.streamingSwapMeta && Array.isArray(action.pools) && action.pools.length > 1) {
            return {
                amount: action.metadata.swap.streamingSwapMeta.outEstimation,
                asset: action.pools[1],
                priceUsd: action.metadata.swap.outPriceUSD
            };
        }
        return undefined;
    }
    // If only one output, return its first coin
    if (action.out.length === 1) return action.out[0].coins[0];
    // If multiple outputs, use pools[1] as the target asset
    const targetAsset = Array.isArray(action.pools) && action.pools.length > 1 ? action.pools[1] : undefined;
    if (targetAsset) {
        for (const out of action.out) {
            for (const coin of out.coins) {
                if (coin.asset === targetAsset) return coin;
            }
        }
    }
    // Fallback: return the first coin of the first output
    return action.out[0].coins[0];
}

module.exports = { calculateUSDValues, DEFAULT_HIGHLIGHT_LIMITS, getEffectiveOutputCoin, getHighlightType, selectOutputCoin }; 