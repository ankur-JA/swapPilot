"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useSendTransaction } from "wagmi";
import { Card, RouteVisualizer, Token, TokenInput } from "~~/components/swappilot";
import { use1inchApi } from "~~/hooks/swappilot";

const Swap: NextPage = () => {
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

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

  // Default tokens for Sepolia testnet
  const defaultTokens: Token[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ethereum",
      address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
      logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
      decimals: 18,
      logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    },
  ];

  useEffect(() => {
    if (defaultTokens.length > 0 && !fromToken) {
      setFromToken(defaultTokens[0]);
    }
    if (defaultTokens.length > 1 && !toToken) {
      setToToken(defaultTokens[1]);
    }
  }, [defaultTokens, fromToken, toToken]);

  const handleGetQuote = async () => {
    if (!fromToken || !toToken || !fromAmount || !address) {
      setError("Please select tokens, enter amount, and connect wallet");
      return;
    }

    setIsLoadingQuote(true);
    setError(null);

    try {
      const amount = parseUnits(fromAmount, fromToken.decimals).toString();
      const quoteData = await getQuote({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount,
        fromAddress: address,
      });

      if (quoteData) {
        setQuote(quoteData);
        setToAmount(formatUnits(BigInt(quoteData.toTokenAmount), toToken.decimals));
      }
    } catch (err) {
      setError("Failed to get quote. Please try again.");
      console.error("Quote error:", err);
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
      }
    } catch (err) {
      setError("Failed to execute swap. Please try again.");
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
                  onChange={setToAmount}
                  selectedToken={toToken}
                  onTokenSelect={setToToken}
                  placeholder="0.0"
                  disabled
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
      </div>
    </div>
  );
};

export default Swap;
