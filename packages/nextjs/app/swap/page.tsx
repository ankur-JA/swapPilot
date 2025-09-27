"use client";

import { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useSendTransaction } from "wagmi";
import {
  Card,
  Chain,
  ChainSelector,
  RouteVisualizer,
  SUPPORTED_CHAINS,
  Token,
  TokenInput,
} from "~~/components/swappilot";
import { TOKEN_ADDRESSES, testApiConnection, use1inchApi } from "~~/hooks/swappilot";

const Swap: NextPage = () => {
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0]); // Default to Ethereum Mainnet
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isLoadingSwap, setIsLoadingSwap] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { getQuote, getSwapTransaction } = use1inchApi();

  // Default tokens based on selected chain
  const defaultTokens: Token[] = useMemo(() => {
    const chainTokens = TOKEN_ADDRESSES[selectedChain.id as keyof typeof TOKEN_ADDRESSES];
    return [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: chainTokens.ETH,
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
      },
      {
        symbol: "WETH",
        name: "Wrapped Ethereum",
        address: chainTokens.WETH,
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: chainTokens.USDC,
        decimals: 6,
        logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        address: chainTokens.DAI,
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
      },
    ];
  }, [selectedChain.id]);

  useEffect(() => {
    if (defaultTokens.length > 0 && !fromToken) {
      setFromToken(defaultTokens[0]);
    }
    if (defaultTokens.length > 1 && !toToken) {
      setToToken(defaultTokens[1]);
    }

    // Test API connection on component mount
    testApiConnection(selectedChain.id);
  }, [defaultTokens, fromToken, toToken, selectedChain.id]);

  const handleGetQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || !address) {
      setError("Please select tokens, enter amount, and connect wallet");
      return;
    }

    if (parseFloat(fromAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoadingQuote(true);
    setError(null);

    try {
      const amount = parseUnits(fromAmount, fromToken.decimals).toString();

      console.log("Getting quote with params:", {
        chainId: selectedChain.id,
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount,
        fromAddress: address,
      });

      const quoteData = await getQuote({
        chainId: selectedChain.id,
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount,
        fromAddress: address,
      });

      console.log("Quote response:", quoteData);

      if (quoteData) {
        setQuote(quoteData);
        setToAmount(formatUnits(BigInt(quoteData.toTokenAmount), toToken.decimals));
      } else {
        setError("No quote available for this swap");
      }
    } catch (err: any) {
      console.error("Quote error details:", err);
      const errorMessage =
        err?.response?.data?.description ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to get quote. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !address || !quote) {
      setError("Please get a quote first");
      return;
    }

    setIsLoadingSwap(true);
    setError(null);

    try {
      const amount = parseUnits(fromAmount, fromToken.decimals).toString();
      const swapData = await getSwapTransaction({
        chainId: selectedChain.id,
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount,
        fromAddress: address,
        slippage: slippage,
      });

      if (swapData) {
        // Execute the swap transaction
        const tx = await sendTransactionAsync({
          to: swapData.tx.to as `0x${string}`,
          data: swapData.tx.data as `0x${string}`,
          value: BigInt(swapData.tx.value || "0"),
        });

        console.log("Swap transaction sent:", tx);
        setError(null);

        // Reset form after successful swap
        setFromAmount("");
        setToAmount("");
        setQuote(null);
      } else {
        setError("Failed to generate swap transaction");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.description || err?.message || "Failed to execute swap. Please try again.";
      setError(errorMessage);
      console.error("Swap error:", err);
    } finally {
      setIsLoadingSwap(false);
    }
  };

  const handleSwapDirection = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;

    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setQuote(null);
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center mb-8">
          <span className="block text-2xl mb-2">SwapPilot</span>
          <span className="block text-4xl font-bold">Smart Token Swapping</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Swap Interface */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Chain Selector */}
                <div className="flex flex-col space-y-2">
                  <label className="text-lg font-semibold text-base-content">Network</label>
                  <ChainSelector selectedChain={selectedChain} onChainSelect={setSelectedChain} />
                </div>

                {/* From Token */}
                <TokenInput
                  label="From"
                  value={fromAmount}
                  onChange={setFromAmount}
                  selectedToken={fromToken}
                  onTokenSelect={setFromToken}
                  placeholder="0.0"
                />

                {/* Swap Direction Button */}
                <div className="flex justify-center">
                  <button onClick={handleSwapDirection} className="btn btn-circle btn-primary" type="button">
                    ↕
                  </button>
                </div>

                {/* To Token */}
                <TokenInput
                  label="To"
                  value={toAmount}
                  onChange={() => {}} // Read-only
                  selectedToken={toToken}
                  onTokenSelect={setToToken}
                  placeholder="0.0"
                  disabled={true}
                />

                {/* Slippage Settings */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Slippage:</label>
                  <div className="flex space-x-2">
                    {[0.5, 1, 3].map(value => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`btn btn-sm ${slippage === value ? "btn-primary" : "btn-outline"}`}
                        type="button"
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleGetQuote}
                    disabled={!fromToken || !toToken || !fromAmount || isLoadingQuote}
                    className="btn btn-primary flex-1"
                    type="button"
                  >
                    {isLoadingQuote ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Getting Quote...
                      </>
                    ) : (
                      "Get Quote"
                    )}
                  </button>

                  <button
                    onClick={handleSwap}
                    disabled={!quote || isLoadingSwap}
                    className="btn btn-secondary flex-1"
                    type="button"
                  >
                    {isLoadingSwap ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Swapping...
                      </>
                    ) : (
                      "Confirm Swap"
                    )}
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Route Visualization */}
          <div className="lg:col-span-1">
            <RouteVisualizer
              route={
                quote
                  ? {
                      fromToken: { symbol: fromToken?.symbol || "", address: fromToken?.address || "" },
                      toToken: { symbol: toToken?.symbol || "", address: toToken?.address || "" },
                      protocols: quote.protocols || [],
                      estimatedGas: quote.estimatedGas || "0",
                      priceImpact: quote.priceImpact || 0,
                    }
                  : null
              }
              isLoading={isLoadingQuote}
            />
          </div>
        </div>

        {/* Connection Status */}
        {!address && (
          <div className="mt-6 text-center">
            <div className="alert alert-warning">
              <span>Please connect your wallet to start swapping</span>
            </div>
          </div>
        )}

        {/* Network Warning */}
        {address && (
          <div className="mt-6 text-center">
            <div className="alert alert-info">
              <span>Make sure your wallet is connected to Sepolia testnet (Chain ID: 11155111)</span>
            </div>
          </div>
        )}

        {/* API Status */}
        <div className="mt-4 text-center">
          <div className="alert alert-warning">
            <span>Note: Make sure you have added your 1inch API key to .env.local file</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
