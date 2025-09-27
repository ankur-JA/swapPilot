"use client";

import { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Card, Chain, ChainSelector, SUPPORTED_CHAINS, Token, TokenInput } from "~~/components/swappilot";
import { TOKEN_ADDRESSES } from "~~/hooks/swappilot";

interface LimitOrder {
  id: string;
  type: "buy" | "sell";
  fromToken: Token;
  toToken: Token;
  amount: string;
  targetPrice: string;
  status: "active" | "filled" | "cancelled";
  createdAt: Date;
  expiresAt?: Date;
}

const LimitOrdersPage: NextPage = () => {
  const { address } = useAccount();
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0]);
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "orders">("create");

  // Form state
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");

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

  const handleCreateOrder = () => {
    if (!fromToken || !toToken || !amount || !targetPrice) {
      alert("Please fill in all fields");
      return;
    }

    const newOrder: LimitOrder = {
      id: Date.now().toString(),
      type: orderType,
      fromToken,
      toToken,
      amount,
      targetPrice,
      status: "active",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000),
    };

    setOrders([newOrder, ...orders]);

    // Reset form
    setAmount("");
    setTargetPrice("");
    setActiveTab("orders");
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(order => (order.id === orderId ? { ...order, status: "cancelled" as const } : order)));
  };

  const activeOrders = orders.filter(order => order.status === "active");
  const completedOrders = orders.filter(order => order.status !== "active");

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Limit Orders</span>
            <span className="block text-lg text-accent mt-2">Set price targets for your swaps</span>
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
              Create Order
            </button>
            <button
              className={`btn ${activeTab === "orders" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActiveTab("orders")}
            >
              My Orders ({activeOrders.length})
            </button>
          </div>

          {activeTab === "create" ? (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Create Limit Order</h2>

              {/* Order Type */}
              <div className="mb-6">
                <label className="text-lg font-semibold text-base-content mb-2 block">Order Type</label>
                <div className="flex space-x-4">
                  <button
                    className={`btn ${orderType === "buy" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setOrderType("buy")}
                  >
                    Buy {toToken?.symbol || "Token"}
                  </button>
                  <button
                    className={`btn ${orderType === "sell" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setOrderType("sell")}
                  >
                    Sell {fromToken?.symbol || "Token"}
                  </button>
                </div>
              </div>

              {/* Token Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <TokenInput
                  label={orderType === "buy" ? "Pay with" : "Sell"}
                  value={amount}
                  onChange={setAmount}
                  selectedToken={fromToken}
                  onTokenSelect={setFromToken}
                  placeholder="0.0"
                />
                <TokenInput
                  label={orderType === "buy" ? "Buy" : "Receive"}
                  value=""
                  onChange={() => {}}
                  selectedToken={toToken}
                  onTokenSelect={setToToken}
                  placeholder="0.0"
                  readOnly={true}
                />
              </div>

              {/* Target Price */}
              <div className="mb-6">
                <label className="text-lg font-semibold text-base-content mb-2 block">
                  Target Price ({toToken?.symbol}/{fromToken?.symbol})
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="Enter target price"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                />
              </div>

              {/* Expiry */}
              <div className="mb-6">
                <label className="text-lg font-semibold text-base-content mb-2 block">Order Expiry (days)</label>
                <select
                  className="select select-bordered w-full max-w-xs"
                  value={expiryDays}
                  onChange={e => setExpiryDays(e.target.value)}
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              {/* Create Order Button */}
              <button className="btn btn-primary btn-lg w-full" onClick={handleCreateOrder} disabled={!address}>
                {!address ? "Connect Wallet to Create Order" : "Create Limit Order"}
              </button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Active Orders</h2>
                  <div className="space-y-4">
                    {activeOrders.map(order => (
                      <div key={order.id} className="border border-base-300 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`badge ${order.type === "buy" ? "badge-success" : "badge-error"}`}>
                                {order.type.toUpperCase()}
                              </span>
                              <span className="text-sm text-accent">
                                {order.fromToken.symbol} → {order.toToken.symbol}
                              </span>
                            </div>
                            <p className="text-sm">
                              Amount: {order.amount} {order.fromToken.symbol}
                            </p>
                            <p className="text-sm">
                              Target Price: {order.targetPrice} {order.toToken.symbol}/{order.fromToken.symbol}
                            </p>
                            <p className="text-sm text-accent">Expires: {order.expiresAt?.toLocaleDateString()}</p>
                          </div>
                          <button className="btn btn-sm btn-error" onClick={() => handleCancelOrder(order.id)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Completed Orders */}
              {completedOrders.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Order History</h2>
                  <div className="space-y-4">
                    {completedOrders.map(order => (
                      <div key={order.id} className="border border-base-300 rounded-lg p-4 opacity-75">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`badge ${order.type === "buy" ? "badge-success" : "badge-error"}`}>
                                {order.type.toUpperCase()}
                              </span>
                              <span
                                className={`badge ${order.status === "filled" ? "badge-success" : "badge-warning"}`}
                              >
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm">
                              {order.amount} {order.fromToken.symbol} → {order.toToken.symbol}
                            </p>
                            <p className="text-sm text-accent">Created: {order.createdAt.toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {orders.length === 0 && (
                <Card className="p-6 text-center">
                  <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
                  <p className="text-accent mb-4">
                    Create your first limit order to get started with automated trading.
                  </p>
                  <button className="btn btn-primary" onClick={() => setActiveTab("create")}>
                    Create Order
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

export default LimitOrdersPage;
