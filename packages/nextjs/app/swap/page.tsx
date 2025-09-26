"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { Card, RouteVisualizer, SwapRoute, Token, TokenInput } from "~~/components/swappilot";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
import { use1inchApi } from "~~/hooks/swappilot";

const SwapPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { getQuote, getSwapTransaction, isLoading: apiLoading, error: apiError } = use1inchApi();
  const transactor = useTransactor();

  // State for swap interface
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [swapRoute, setSwapRoute] = useState<SwapRoute | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [, setSwapTransaction] = useState<any>(null);
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);

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

  // Get quote from 1inch API
  const handleGetQuote = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    setIsLoadingQuote(true);

    try {
      const quote = await getQuote({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: fromAmount,
        fromAddress: connectedAddress,
        slippage: 1, // 1% slippage
      });

      if (quote) {
        // Transform 1inch quote to our SwapRoute format
        const route: SwapRoute = {
          fromToken: quote.fromToken,
          toToken: quote.toToken,
          protocols: quote.protocols.map(p => ({
            name: p.name,
            part: p.part,
          })),
          estimatedGas: quote.estimatedGas,
          priceImpact: quote.priceImpact,
        };

        setSwapRoute(route);
        // Convert wei to token amount (simplified)
        const toAmountFormatted = (parseFloat(quote.toTokenAmount) / Math.pow(10, quote.toToken.decimals)).toString();
        setToAmount(toAmountFormatted);
      }
    } catch (error) {
      console.error("Failed to get quote:", error);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Execute swap using 1inch API and Wagmi
  const handleSwap = async () => {
    if (!swapRoute || !fromToken || !toToken || !connectedAddress) return;

    setIsExecutingSwap(true);

    try {
      // Get swap transaction from 1inch API
      const swapTx = await getSwapTransaction({
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: fromAmount,
        fromAddress: connectedAddress,
        slippage: 1, // 1% slippage
      });

      if (swapTx) {
        setSwapTransaction(swapTx);

        // Execute the transaction using the transactor
        const txHash = await transactor({
          to: swapTx.tx.to as `0x${string}`,
          data: swapTx.tx.data as `0x${string}`,
          value: BigInt(swapTx.tx.value),
          gas: BigInt(swapTx.tx.gas),
          gasPrice: BigInt(swapTx.tx.gasPrice),
        });

        if (txHash) {
          console.log("Swap transaction submitted:", txHash);
          // Reset form after successful swap
          setFromAmount("");
          setToAmount("");
          setSwapRoute(null);
          setSwapTransaction(null);
        }
      }
    } catch (error) {
      console.error("Failed to execute swap:", error);
    } finally {
      setIsExecutingSwap(false);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-2xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Swap</span>
            <span className="block text-lg text-accent mt-2">Trade tokens with the best rates</span>
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

            {/* API Error Display */}
            {apiError && (
              <div className="alert alert-error">
                <span>Error: {apiError}</span>
              </div>
            )}

            {/* Get Quote Button */}
            <button
              onClick={handleGetQuote}
              className="btn btn-primary w-full"
              disabled={!fromToken || !toToken || !fromAmount || isLoadingQuote || apiLoading}
            >
              {isLoadingQuote || apiLoading ? (
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
            <button
              onClick={handleSwap}
              className="btn btn-success w-full"
              disabled={!swapRoute || !connectedAddress || isExecutingSwap || apiLoading}
            >
              {!connectedAddress ? (
                "Connect Wallet to Swap"
              ) : isExecutingSwap ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Executing Swap...
                </>
              ) : (
                "Swap"
              )}
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

export default SwapPage;
