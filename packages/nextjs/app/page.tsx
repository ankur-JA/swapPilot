"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { Card, RouteVisualizer, SwapRoute, Token, TokenInput } from "~~/components/swappilot";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // State for swap interface
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [swapRoute, setSwapRoute] = useState<SwapRoute | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  // Toggle swap direction
  const handleSwapDirection = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;

    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setSwapRoute(null); // Clear route when direction changes
  };

  // Get quote (placeholder for now)
  const handleGetQuote = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsLoadingQuote(true);

    // Simulate API call delay
    setTimeout(() => {
      // Mock route data
      const mockRoute: SwapRoute = {
        fromToken: { symbol: fromToken.symbol, address: fromToken.address },
        toToken: { symbol: toToken.symbol, address: toToken.address },
        protocols: [
          { name: "Uniswap V3", part: 70 },
          { name: "SushiSwap", part: 30 },
        ],
        estimatedGas: "0.002",
        priceImpact: 0.5,
      };

      setSwapRoute(mockRoute);
      setToAmount((parseFloat(fromAmount) * 0.95).toString()); // Mock conversion
      setIsLoadingQuote(false);
    }, 1000);
  };

  // Execute swap (placeholder for now)
  const handleSwap = async () => {
    if (!swapRoute) return;

    // TODO: Implement actual swap logic with 1inch API and Wagmi
    console.log("Executing swap:", { fromToken, toToken, fromAmount, toAmount, route: swapRoute });
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-2xl">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">SwapPilot</span>
            <span className="block text-lg text-accent mt-2">Smart crypto swapping dashboard</span>
          </h1>

          {/* Swap Interface */}
          <Card className="space-y-6">
            {/* From Token Input */}
            <TokenInput
              label="From"
              value={fromAmount}
              onChange={setFromAmount}
              selectedToken={fromToken}
              onTokenSelect={setFromToken}
              placeholder="0.0"
            />

            {/* Swap Direction Toggle */}
            <div className="flex justify-center">
              <button
                onClick={handleSwapDirection}
                className="btn btn-circle btn-primary"
                disabled={!fromToken || !toToken}
              >
                <ArrowsUpDownIcon className="h-5 w-5" />
              </button>
            </div>

            {/* To Token Input */}
            <TokenInput
              label="To"
              value={toAmount}
              onChange={setToAmount}
              selectedToken={toToken}
              onTokenSelect={setToToken}
              placeholder="0.0"
            />

            {/* Get Quote Button */}
            <button
              onClick={handleGetQuote}
              className="btn btn-primary w-full"
              disabled={!fromToken || !toToken || !fromAmount || isLoadingQuote}
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

            {/* Route Visualizer */}
            <RouteVisualizer route={swapRoute} isLoading={isLoadingQuote} />

            {/* Swap Button */}
            <button onClick={handleSwap} className="btn btn-success w-full" disabled={!swapRoute || !connectedAddress}>
              {!connectedAddress ? "Connect Wallet to Swap" : "Swap"}
            </button>
          </Card>

          {/* Connection Status */}
          {connectedAddress && (
            <div className="mt-6 text-center">
              <p className="text-sm text-accent">
                Connected:{" "}
                <span className="font-mono">
                  {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
