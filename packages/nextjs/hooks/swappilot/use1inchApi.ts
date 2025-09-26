import { useCallback, useState } from "react";
import axios from "axios";

// 1inch API base URL
const ONEINCH_API_BASE = "https://api.1inch.io/v5.0/1";

// Common token addresses on Ethereum mainnet
export const TOKEN_ADDRESSES = {
  ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC: "0xA0b86a33E6441b8c4C8C0E4A0b86a33E6441b8c4C",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
} as const;

export interface QuoteResponse {
  fromToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
  };
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: Array<{
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
  }>;
  estimatedGas: string;
  priceImpact?: number;
}

export interface SwapTransactionResponse {
  fromToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: Array<{
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
  }>;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: string;
  };
}

export interface Use1inchApiReturn {
  getQuote: (params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress?: string;
    slippage?: number;
  }) => Promise<QuoteResponse | null>;
  getSwapTransaction: (params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    slippage?: number;
  }) => Promise<SwapTransactionResponse | null>;
  isLoading: boolean;
  error: string | null;
}

export const use1inchApi = (): Use1inchApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(
    async (params: {
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
      fromAddress?: string;
      slippage?: number;
    }): Promise<QuoteResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const { fromTokenAddress, toTokenAddress, amount, fromAddress, slippage = 1 } = params;

        // Convert amount to wei (assuming 18 decimals for simplicity)
        const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString();

        const response = await axios.get(`${ONEINCH_API_BASE}/quote`, {
          params: {
            fromTokenAddress,
            toTokenAddress,
            amount: amountInWei,
            ...(fromAddress && { fromAddress }),
            slippage,
          },
        });

        const data = response.data;

        // Transform the response to match our interface
        const quote: QuoteResponse = {
          fromToken: {
            symbol: data.fromToken?.symbol || "Unknown",
            name: data.fromToken?.name || "Unknown Token",
            address: data.fromToken?.address || fromTokenAddress,
            decimals: data.fromToken?.decimals || 18,
            logoURI: data.fromToken?.logoURI,
          },
          toToken: {
            symbol: data.toToken?.symbol || "Unknown",
            name: data.toToken?.name || "Unknown Token",
            address: data.toToken?.address || toTokenAddress,
            decimals: data.toToken?.decimals || 18,
            logoURI: data.toToken?.logoURI,
          },
          toTokenAmount: data.toTokenAmount,
          fromTokenAmount: data.fromTokenAmount,
          protocols:
            data.protocols?.map((protocol: any) => ({
              name: protocol.name || "Unknown Protocol",
              part: protocol.part || 0,
              fromTokenAddress: protocol.fromTokenAddress,
              toTokenAddress: protocol.toTokenAddress,
            })) || [],
          estimatedGas: data.estimatedGas || "0",
          priceImpact: data.priceImpact ? parseFloat(data.priceImpact) : undefined,
        };

        return quote;
      } catch (err: any) {
        const errorMessage = err.response?.data?.description || err.message || "Failed to get quote";
        setError(errorMessage);
        console.error("1inch API Error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getSwapTransaction = useCallback(
    async (params: {
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
      fromAddress: string;
      slippage?: number;
    }): Promise<SwapTransactionResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const { fromTokenAddress, toTokenAddress, amount, fromAddress, slippage = 1 } = params;

        // Convert amount to wei (assuming 18 decimals for simplicity)
        const amountInWei = (parseFloat(amount) * Math.pow(10, 18)).toString();

        const response = await axios.get(`${ONEINCH_API_BASE}/swap`, {
          params: {
            fromTokenAddress,
            toTokenAddress,
            amount: amountInWei,
            fromAddress,
            slippage,
          },
        });

        const data = response.data;

        // Transform the response to match our interface
        const swapTx: SwapTransactionResponse = {
          fromToken: {
            symbol: data.fromToken?.symbol || "Unknown",
            name: data.fromToken?.name || "Unknown Token",
            address: data.fromToken?.address || fromTokenAddress,
            decimals: data.fromToken?.decimals || 18,
          },
          toToken: {
            symbol: data.toToken?.symbol || "Unknown",
            name: data.toToken?.name || "Unknown Token",
            address: data.toToken?.address || toTokenAddress,
            decimals: data.toToken?.decimals || 18,
          },
          toTokenAmount: data.toTokenAmount,
          fromTokenAmount: data.fromTokenAmount,
          protocols:
            data.protocols?.map((protocol: any) => ({
              name: protocol.name || "Unknown Protocol",
              part: protocol.part || 0,
              fromTokenAddress: protocol.fromTokenAddress,
              toTokenAddress: protocol.toTokenAddress,
            })) || [],
          tx: {
            from: data.tx.from,
            to: data.tx.to,
            data: data.tx.data,
            value: data.tx.value,
            gasPrice: data.tx.gasPrice,
            gas: data.tx.gas,
          },
        };

        return swapTx;
      } catch (err: any) {
        const errorMessage = err.response?.data?.description || err.message || "Failed to get swap transaction";
        setError(errorMessage);
        console.error("1inch API Error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    getQuote,
    getSwapTransaction,
    isLoading,
    error,
  };
};
