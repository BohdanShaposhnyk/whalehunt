export interface Coin {
  amount: string;
  asset: string;
}

export interface SwapMetadata {
  affiliateAddress: string;
  affiliateFee: string;
  inPriceUSD: string;
  isStreamingSwap: boolean;
  liquidityFee: string;
  memo: string;
  networkFees: Coin[];
  outPriceUSD: string;
  swapSlip: string;
  swapTarget: string;
  txType: string;
  streamingSwapMeta?: {
    count: string;
    depositedCoin: Coin;
    inCoin: Coin;
    interval: string;
    lastHeight: string;
    outCoin: Coin;
    outEstimation: string;
    quantity: string;
  };
}

export interface Action {
  date: string;
  height: string;
  in: Array<{
    address: string;
    coins: Coin[];
    txID: string;
  }>;
  metadata: {
    swap: SwapMetadata;
  };
  out: Array<{
    address: string;
    coins: Coin[];
    height?: string;
    txID: string;
    affiliate?: boolean;
  }>;
  pools: string[];
  status: string;
  type: string;
  // Backend-calculated fields
  inputUsd?: number;
  outputUsd?: number;
  maxUsd?: number;
  highlightType?: 'none' | 'blue' | 'green' | 'yellow' | 'red';
} 