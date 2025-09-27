import { useCallback, useState } from "react";
import axios from "axios";

// 1inch API key
const ONEINCH_API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;

// Token addresses for different chains
export const TOKEN_ADDRESSES = {
  // Ethereum Mainnet (chainId: 1)
  1: {
    ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27EAD9083C756Cc2",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  // Optimism (chainId: 10)
  10: {
    ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
  },
} as const;

// Helper function to get 1inch API base URL for a chain
export const get1inchApiBase = (chainId: number) => {
  return `https://api.1inch.io/v5.0/${chainId}`;
};

// Debug function to test API connectivity
export const testApiConnection = async (chainId: number = 1) => {
  try {
    const apiBase = get1inchApiBase(chainId);
    const response = await axios.get(`${apiBase}/tokens`, {
      headers: {
        ...(ONEINCH_API_KEY && { Authorization: `Bearer ${ONEINCH_API_KEY}` }),
      },
    });
    console.log("API connection test successful:", response.data);
    return true;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
};

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
    chainId: number;
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress?: string;
    slippage?: number;
  }) => Promise<QuoteResponse | null>;
  getSwapTransaction: (params: {
    chainId: number;
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    slippage?: number;
  }) => Promise<SwapTransactionResponse | null>;
  getTokens: (chainId: number) => Promise<any>;
  getWalletBalances: (chainId: number, address: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const use1inchApi = (): Use1inchApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(
    async (params: {
      chainId: number;
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
      fromAddress?: string;
      slippage?: number;
    }): Promise<QuoteResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const { chainId, fromTokenAddress, toTokenAddress, amount, fromAddress, slippage = 1 } = params;

        // Use the amount as-is (already in wei format from parseUnits)
        const amountInWei = amount;
        const apiBase = get1inchApiBase(chainId);

        console.log("1inch API request:", {
          url: `${apiBase}/quote`,
          chainId,
          params: {
            fromTokenAddress,
            toTokenAddress,
            amount: amountInWei,
            ...(fromAddress && { fromAddress }),
            slippage,
          },
          hasApiKey: !!ONEINCH_API_KEY,
        });

        const response = await axios.get(`${apiBase}/quote`, {
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
      chainId: number;
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
      fromAddress: string;
      slippage?: number;
    }): Promise<SwapTransactionResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const { chainId, fromTokenAddress, toTokenAddress, amount, fromAddress, slippage = 1 } = params;

        // Use the amount as-is (already in wei format from parseUnits)
        const amountInWei = amount;
        const apiBase = get1inchApiBase(chainId);

        const response = await axios.get(`${apiBase}/swap`, {
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

  const getTokens = useCallback(async (chainId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiBase = get1inchApiBase(chainId);
      const response = await axios.get(`${apiBase}/tokens`, {
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

  const getWalletBalances = useCallback(async (chainId: number, address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiBase = get1inchApiBase(chainId);
      const response = await axios.get(`${apiBase}/wallet/balances`, {
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
