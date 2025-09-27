"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Card, Chain, ChainSelector, SUPPORTED_CHAINS } from "~~/components/swappilot";

interface PortfolioAsset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change24h: number;
  changePercent: number;
  logoURI: string;
}

interface Transaction {
  id: string;
  type: "buy" | "sell" | "swap";
  fromToken: string;
  toToken: string;
  amount: number;
  value: number;
  timestamp: Date;
  pnl?: number;
}

const PortfolioPage: NextPage = () => {
  const { address } = useAccount();
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "analytics">("overview");

  // Mock portfolio data
  const portfolioAssets: PortfolioAsset[] = [
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 2.5,
      value: 10000,
      change24h: 250,
      changePercent: 2.56,
      logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      amount: 5000,
      value: 5000,
      change24h: 0,
      changePercent: 0,
      logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      amount: 3000,
      value: 3000,
      change24h: 15,
      changePercent: 0.5,
      logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "1",
      type: "buy",
      fromToken: "USDC",
      toToken: "ETH",
      amount: 1.0,
      value: 4000,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      pnl: 500,
    },
    {
      id: "2",
      type: "swap",
      fromToken: "DAI",
      toToken: "USDC",
      amount: 1000,
      value: 1000,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "buy",
      fromToken: "USDC",
      toToken: "ETH",
      amount: 1.5,
      value: 6000,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      pnl: 750,
    },
  ];

  const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange24h = portfolioAssets.reduce((sum, asset) => sum + asset.change24h, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;

  const handleExportPortfolio = () => {
    // Mock export functionality
    const data = {
      totalValue,
      totalChange24h,
      totalChangePercent,
      assets: portfolioAssets,
      transactions,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Portfolio</span>
            <span className="block text-lg text-accent mt-2">Track your crypto investments and performance</span>
          </h1>

          {/* Network Selector */}
          <div className="mb-6">
            <label className="text-lg font-semibold text-base-content mb-2 block">Network</label>
            <ChainSelector selectedChain={selectedChain} onChainSelect={setSelectedChain} className="max-w-xs" />
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`btn ${activeTab === "transactions" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
            <button
              className={`btn ${activeTab === "analytics" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>

          {activeTab === "overview" ? (
            <div className="space-y-6">
              {/* Portfolio Summary */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Portfolio Summary</h2>
                  <button className="btn btn-outline btn-sm" onClick={handleExportPortfolio}>
                    Export Data
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-accent">Total Value</p>
                    <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-accent">24h Change</p>
                    <p className={`text-2xl font-bold ${totalChange24h >= 0 ? "text-success" : "text-error"}`}>
                      {totalChange24h >= 0 ? "+" : ""}${totalChange24h.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-accent">24h Change %</p>
                    <p className={`text-2xl font-bold ${totalChangePercent >= 0 ? "text-success" : "text-error"}`}>
                      {totalChangePercent >= 0 ? "+" : ""}
                      {totalChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </Card>

              {/* Asset Allocation */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Asset Allocation</h2>
                <div className="space-y-4">
                  {portfolioAssets.map(asset => {
                    const percentage = (asset.value / totalValue) * 100;
                    return (
                      <div
                        key={asset.symbol}
                        className="flex items-center justify-between p-4 border border-base-300 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <img src={asset.logoURI} alt={asset.symbol} className="h-8 w-8 rounded-full" />
                          <div>
                            <p className="font-semibold">{asset.symbol}</p>
                            <p className="text-sm text-accent">{asset.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${asset.value.toLocaleString()}</p>
                          <p className="text-sm text-accent">
                            {asset.amount.toLocaleString()} {asset.symbol}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${asset.changePercent >= 0 ? "text-success" : "text-error"}`}>
                            {asset.changePercent >= 0 ? "+" : ""}
                            {asset.changePercent.toFixed(2)}%
                          </p>
                          <p className="text-sm text-accent">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          ) : activeTab === "transactions" ? (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
              <div className="space-y-4">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border border-base-300 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          tx.type === "buy" ? "bg-success" : tx.type === "sell" ? "bg-error" : "bg-warning"
                        }`}
                      />
                      <div>
                        <p className="font-semibold">
                          {tx.type.toUpperCase()}: {tx.fromToken} → {tx.toToken}
                        </p>
                        <p className="text-sm text-accent">{tx.timestamp.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${tx.value.toLocaleString()}</p>
                      {tx.pnl && (
                        <p className={`text-sm ${tx.pnl >= 0 ? "text-success" : "text-error"}`}>
                          P&L: {tx.pnl >= 0 ? "+" : ""}${tx.pnl.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Performance Analytics */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Performance Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-base-200 rounded-lg">
                    <h3 className="font-semibold mb-2">Total Return</h3>
                    <p className="text-2xl font-bold text-success">+$1,250</p>
                    <p className="text-sm text-accent">+12.5% overall</p>
                  </div>
                  <div className="p-4 bg-base-200 rounded-lg">
                    <h3 className="font-semibold mb-2">Best Performer</h3>
                    <p className="text-lg font-bold">ETH</p>
                    <p className="text-sm text-success">+25.6% (24h)</p>
                  </div>
                  <div className="p-4 bg-base-200 rounded-lg">
                    <h3 className="font-semibold mb-2">Diversification</h3>
                    <p className="text-lg font-bold">3 Assets</p>
                    <p className="text-sm text-accent">Good spread</p>
                  </div>
                  <div className="p-4 bg-base-200 rounded-lg">
                    <h3 className="font-semibold mb-2">Risk Level</h3>
                    <p className="text-lg font-bold">Medium</p>
                    <p className="text-sm text-warning">Balanced portfolio</p>
                  </div>
                </div>
              </Card>

              {/* Chart Placeholder */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Portfolio Performance</h2>
                <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-2">📈 Performance Chart</p>
                    <p className="text-accent">Chart visualization would be implemented here</p>
                    <p className="text-sm text-accent mt-2">Showing 30-day portfolio value trend</p>
                  </div>
                </div>
              </Card>

              {/* Export Options */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Export Portfolio Data</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="btn btn-outline" onClick={handleExportPortfolio}>
                    Export JSON
                  </button>
                  <button className="btn btn-outline" onClick={() => alert("CSV export would be implemented here")}>
                    Export CSV
                  </button>
                  <button className="btn btn-outline" onClick={() => alert("PDF report would be generated here")}>
                    Generate Report
                  </button>
                </div>
              </Card>
            </div>
          )}

          {!address && (
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-accent mb-4">
                Connect your wallet to view your portfolio and track your crypto investments.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default PortfolioPage;
