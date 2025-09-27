import { useCallback, useState } from "react";
import axios from "axios";

// 1inch API base URL - Using Sepolia testnet (chainId: 11155111)
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111";
const ONEINCH_API_BASE = `https://api.1inch.io/v5.0/${CHAIN_ID}`;
const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;

// Common token addresses on Sepolia testnet
export const TOKEN_ADDRESSES = {
  ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  WETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // Sepolia WETH
  USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
  DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357", // Sepolia DAI
  WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // Placeholder
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
  getTokens: () => Promise<any>;
  getWalletBalances: (address: string) => Promise<any>;
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

        // Use the amount as-is (already in wei format from parseUnits)
        const amountInWei = amount;

        console.log("1inch API request:", {
          url: `${ONEINCH_API_BASE}/quote`,
          params: {
            fromTokenAddress,
            toTokenAddress,
            amount: amountInWei,
            ...(fromAddress && { fromAddress }),
            slippage,
          },
          hasApiKey: !!ONEINCH_API_KEY,
        });

        const response = await axios.get(`${ONEINCH_API_BASE}/quote`, {
          params: {
            fromTokenAddress,
            toTokenAddress,
            amount: amountInWei,
            ...(fromAddress && { fromAddress }),
            slippage,
          },
          headers: {
            ...(ONEINCH_API_KEY && { Authorization: `Bearer ${ONEINCH_API_KEY}` }),
          },
        });

        const data = response.data;
        console.log("1inch API response:", data);

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

        // Use the amount as-is (already in wei format from parseUnits)
        const amountInWei = amount;

        const response = await axios.get(`${ONEINCH_API_BASE}/swap`, {
          params: {
            fromTokenAddress,
            toTokenAddress,
            amount: amountInWei,
            fromAddress,
            slippage,
          },
          headers: {
            ...(ONEINCH_API_KEY && { Authorization: `Bearer ${ONEINCH_API_KEY}` }),
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

  const getTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${ONEINCH_API_BASE}/tokens`, {
        headers: {
          ...(ONEINCH_API_KEY && { Authorization: `Bearer ${ONEINCH_API_KEY}` }),
        },
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.description || err.message || "Failed to get tokens";
      setError(errorMessage);
      console.error("1inch API Error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWalletBalances = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${ONEINCH_API_BASE}/wallet/balances`, {
        params: {
          address,
        },
        headers: {
          ...(ONEINCH_API_KEY && { Authorization: `Bearer ${ONEINCH_API_KEY}` }),
        },
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.description || err.message || "Failed to get wallet balances";
      setError(errorMessage);
      console.error("1inch API Error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getQuote,
    getSwapTransaction,
    getTokens,
    getWalletBalances,
    isLoading,
    error,
  };
};
