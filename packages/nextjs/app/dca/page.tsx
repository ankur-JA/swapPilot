"use client";

import { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Card, Chain, ChainSelector, SUPPORTED_CHAINS, Token, TokenInput } from "~~/components/swappilot";
import { TOKEN_ADDRESSES } from "~~/hooks/swappilot";

interface DCAStrategy {
  id: string;
  name: string;
  fromToken: Token;
  toToken: Token;
  amount: string;
  interval: "daily" | "weekly" | "monthly";
  nextExecution: Date;
  status: "active" | "paused" | "cancelled";
  createdAt: Date;
  totalExecutions: number;
  totalInvested: string;
}

const DCAPage: NextPage = () => {
  const { address } = useAccount();
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0]);
  const [strategies, setStrategies] = useState<DCAStrategy[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "strategies">("create");

  // Form state
  const [strategyName, setStrategyName] = useState("");
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState<"daily" | "weekly" | "monthly">("weekly");

  // Default tokens based on selected chain
  const defaultTokens: Token[] = useMemo(
    () => [
      {
        symbol: "ETH",
        name: "Ethereum",
        address:
          TOKEN_ADDRESSES[selectedChain.id as keyof typeof TOKEN_ADDRESSES]?.ETH ||
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address:
          TOKEN_ADDRESSES[selectedChain.id as keyof typeof TOKEN_ADDRESSES]?.USDC ||
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6,
        logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      },
      {
        symbol: "DAI",
        name: "Dai Stablecoin",
        address:
          TOKEN_ADDRESSES[selectedChain.id as keyof typeof TOKEN_ADDRESSES]?.DAI ||
          "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        decimals: 18,
        logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
      },
    ],
    [selectedChain.id],
  );

  useEffect(() => {
    if (defaultTokens.length > 0 && !fromToken) {
      setFromToken(defaultTokens[0]);
    }
    if (defaultTokens.length > 1 && !toToken) {
      setToToken(defaultTokens[1]);
    }
  }, [defaultTokens, fromToken, toToken]);

  const getNextExecutionDate = (interval: "daily" | "weekly" | "monthly"): Date => {
    const now = new Date();
    switch (interval) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "monthly":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  };

  const handleCreateStrategy = () => {
    if (!fromToken || !toToken || !amount || !strategyName) {
      alert("Please fill in all fields");
      return;
    }

    const newStrategy: DCAStrategy = {
      id: Date.now().toString(),
      name: strategyName,
      fromToken,
      toToken,
      amount,
      interval,
      nextExecution: getNextExecutionDate(interval),
      status: "active",
      createdAt: new Date(),
      totalExecutions: 0,
      totalInvested: "0",
    };

    setStrategies([newStrategy, ...strategies]);

    // Reset form
    setStrategyName("");
    setAmount("");
    setActiveTab("strategies");
  };

  const handlePauseStrategy = (strategyId: string) => {
    setStrategies(
      strategies.map(strategy => (strategy.id === strategyId ? { ...strategy, status: "paused" as const } : strategy)),
    );
  };

  const handleResumeStrategy = (strategyId: string) => {
    setStrategies(
      strategies.map(strategy => (strategy.id === strategyId ? { ...strategy, status: "active" as const } : strategy)),
    );
  };

  const handleCancelStrategy = (strategyId: string) => {
    setStrategies(
      strategies.map(strategy =>
        strategy.id === strategyId ? { ...strategy, status: "cancelled" as const } : strategy,
      ),
    );
  };

  const activeStrategies = strategies.filter(strategy => strategy.status === "active");
  const pausedStrategies = strategies.filter(strategy => strategy.status === "paused");
  const cancelledStrategies = strategies.filter(strategy => strategy.status === "cancelled");

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">DCA Scheduler</span>
            <span className="block text-lg text-accent mt-2">Dollar Cost Average your crypto investments</span>
          </h1>

          {/* Network Selector */}
          <div className="mb-6">
            <label className="text-lg font-semibold text-base-content mb-2 block">Network</label>
            <ChainSelector selectedChain={selectedChain} onChainSelect={setSelectedChain} className="max-w-xs" />
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`btn ${activeTab === "create" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveTab("create")}
            >
              Create Strategy
            </button>
            <button
              className={`btn ${activeTab === "strategies" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveTab("strategies")}
            >
              My Strategies ({activeStrategies.length})
            </button>
          </div>

          {activeTab === "create" ? (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Create DCA Strategy</h2>

              {/* Strategy Name */}
              <div className="mb-6">
                <label className="text-lg font-semibold text-base-content mb-2 block">Strategy Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., ETH DCA Weekly"
                  value={strategyName}
                  onChange={e => setStrategyName(e.target.value)}
                />
              </div>

              {/* Token Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <TokenInput
                  label="Pay with"
                  value={amount}
                  onChange={setAmount}
                  selectedToken={fromToken}
                  onTokenSelect={setFromToken}
                  placeholder="0.0"
                />
                <TokenInput
                  label="Buy"
                  value=""
                  onChange={() => {}}
                  selectedToken={toToken}
                  onTokenSelect={setToToken}
                  placeholder="0.0"
                  readOnly={true}
                />
              </div>

              {/* Interval Selection */}
              <div className="mb-6">
                <label className="text-lg font-semibold text-base-content mb-2 block">Purchase Interval</label>
                <div className="flex space-x-4">
                  <button
                    className={`btn ${interval === "daily" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setInterval("daily")}
                  >
                    Daily
                  </button>
                  <button
                    className={`btn ${interval === "weekly" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setInterval("weekly")}
                  >
                    Weekly
                  </button>
                  <button
                    className={`btn ${interval === "monthly" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setInterval("monthly")}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Strategy Summary */}
              <div className="mb-6 p-4 bg-base-200 rounded-lg">
                <h3 className="font-semibold mb-2">Strategy Summary</h3>
                <p className="text-sm text-accent">
                  {strategyName || "Unnamed Strategy"}: Buy {amount || "0"} {toToken?.symbol || "Token"}
                  every {interval} using {fromToken?.symbol || "Token"}
                </p>
                <p className="text-sm text-accent mt-1">
                  Next execution: {getNextExecutionDate(interval).toLocaleDateString()}
                </p>
              </div>

              {/* Create Strategy Button */}
              <button className="btn btn-primary btn-lg w-full" onClick={handleCreateStrategy} disabled={!address}>
                {!address ? "Connect Wallet to Create Strategy" : "Create DCA Strategy"}
              </button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active Strategies */}
              {activeStrategies.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Active Strategies</h2>
                  <div className="space-y-4">
                    {activeStrategies.map(strategy => (
                      <div key={strategy.id} className="border border-base-300 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="badge badge-success">ACTIVE</span>
                              <span className="text-sm text-accent">
                                {strategy.fromToken.symbol} → {strategy.toToken.symbol}
                              </span>
                            </div>
                            <h3 className="font-semibold">{strategy.name}</h3>
                            <p className="text-sm">
                              Amount: {strategy.amount} {strategy.fromToken.symbol} every {strategy.interval}
                            </p>
                            <p className="text-sm">Next execution: {strategy.nextExecution.toLocaleDateString()}</p>
                            <p className="text-sm text-accent">
                              Executions: {strategy.totalExecutions} | Total invested: {strategy.totalInvested}{" "}
                              {strategy.fromToken.symbol}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="btn btn-sm btn-warning" onClick={() => handlePauseStrategy(strategy.id)}>
                              Pause
                            </button>
                            <button className="btn btn-sm btn-error" onClick={() => handleCancelStrategy(strategy.id)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Paused Strategies */}
              {pausedStrategies.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Paused Strategies</h2>
                  <div className="space-y-4">
                    {pausedStrategies.map(strategy => (
                      <div key={strategy.id} className="border border-base-300 rounded-lg p-4 opacity-75">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="badge badge-warning">PAUSED</span>
                              <span className="text-sm text-accent">
                                {strategy.fromToken.symbol} → {strategy.toToken.symbol}
                              </span>
                            </div>
                            <h3 className="font-semibold">{strategy.name}</h3>
                            <p className="text-sm">
                              {strategy.amount} {strategy.fromToken.symbol} every {strategy.interval}
                            </p>
                            <p className="text-sm text-accent">
                              Executions: {strategy.totalExecutions} | Total invested: {strategy.totalInvested}{" "}
                              {strategy.fromToken.symbol}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleResumeStrategy(strategy.id)}
                            >
                              Resume
                            </button>
                            <button className="btn btn-sm btn-error" onClick={() => handleCancelStrategy(strategy.id)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Cancelled Strategies */}
              {cancelledStrategies.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Strategy History</h2>
                  <div className="space-y-4">
                    {cancelledStrategies.map(strategy => (
                      <div key={strategy.id} className="border border-base-300 rounded-lg p-4 opacity-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="badge badge-error">CANCELLED</span>
                              <span className="text-sm text-accent">
                                {strategy.fromToken.symbol} → {strategy.toToken.symbol}
                              </span>
                            </div>
                            <h3 className="font-semibold">{strategy.name}</h3>
                            <p className="text-sm">
                              {strategy.amount} {strategy.fromToken.symbol} every {strategy.interval}
                            </p>
                            <p className="text-sm text-accent">
                              Created: {strategy.createdAt.toLocaleDateString()} | Executions:{" "}
                              {strategy.totalExecutions} | Total invested: {strategy.totalInvested}{" "}
                              {strategy.fromToken.symbol}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {strategies.length === 0 && (
                <Card className="p-6 text-center">
                  <h2 className="text-2xl font-bold mb-4">No DCA Strategies Yet</h2>
                  <p className="text-accent mb-4">
                    Create your first DCA strategy to start dollar-cost averaging your crypto investments.
                  </p>
                  <button className="btn btn-primary" onClick={() => setActiveTab("create")}>
                    Create Strategy
                  </button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DCAPage;
