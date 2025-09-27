"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { Card } from "~~/components/swappilot";

const SettingsPage: NextPage = () => {
  const [slippage, setSlippage] = useState(1);
  const [customSlippage, setCustomSlippage] = useState("");
  const [defaultFromToken, setDefaultFromToken] = useState("ETH");
  const [defaultToToken, setDefaultToToken] = useState("USDC");
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    transactionUpdates: true,
    limitOrderFills: true,
    dcaExecutions: true,
  });
  const [theme, setTheme] = useState("light");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [privacy, setPrivacy] = useState({
    analytics: true,
    crashReports: false,
    shareData: false,
  });

  const handleSaveSettings = () => {
    // Mock save functionality
    const settings = {
      slippage: customSlippage ? parseFloat(customSlippage) : slippage,
      defaultFromToken,
      defaultToToken,
      notifications,
      theme,
      apiKey,
      privacy,
    };

    localStorage.setItem("swappilot-settings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      setSlippage(1);
      setCustomSlippage("");
      setDefaultFromToken("ETH");
      setDefaultToToken("USDC");
      setNotifications({
        priceAlerts: true,
        transactionUpdates: true,
        limitOrderFills: true,
        dcaExecutions: true,
      });
      setTheme("light");
      setApiKey("");
      setPrivacy({
        analytics: true,
        crashReports: false,
        shareData: false,
      });
      localStorage.removeItem("swappilot-settings");
      alert("Settings reset to default!");
    }
  };

  const handleExportSettings = () => {
    const settings = {
      slippage: customSlippage ? parseFloat(customSlippage) : slippage,
      defaultFromToken,
      defaultToToken,
      notifications,
      theme,
      privacy,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swappilot-settings-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Settings</span>
            <span className="block text-lg text-accent mt-2">Configure your SwapPilot experience</span>
          </h1>

          <div className="space-y-6">
            {/* Slippage Tolerance Settings */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Slippage Tolerance</h2>
              <div className="space-y-4">
                <p className="text-sm text-accent">
                  Set your preferred slippage tolerance for swaps. Higher slippage means more tolerance for price
                  changes.
                </p>
                <div className="flex space-x-4">
                  {[0.5, 1, 3, 5].map(value => (
                    <button
                      key={value}
                      className={`btn ${slippage === value ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium">Custom:</label>
                  <input
                    type="number"
                    className="input input-bordered w-24"
                    placeholder="0.0"
                    value={customSlippage}
                    onChange={e => setCustomSlippage(e.target.value)}
                  />
                  <span className="text-sm text-accent">%</span>
                </div>
              </div>
            </Card>

            {/* Default Token Preferences */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Default Token Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Default From Token</label>
                  <select
                    className="select select-bordered w-full"
                    value={defaultFromToken}
                    onChange={e => setDefaultFromToken(e.target.value)}
                  >
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                    <option value="WBTC">WBTC</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Default To Token</label>
                  <select
                    className="select select-bordered w-full"
                    value={defaultToToken}
                    onChange={e => setDefaultToToken(e.target.value)}
                  >
                    <option value="USDC">USDC</option>
                    <option value="ETH">ETH</option>
                    <option value="DAI">DAI</option>
                    <option value="WBTC">WBTC</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Price Alerts</p>
                    <p className="text-sm text-accent">Get notified when token prices reach your targets</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={notifications.priceAlerts}
                    onChange={e => setNotifications({ ...notifications, priceAlerts: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transaction Updates</p>
                    <p className="text-sm text-accent">Receive updates on your swap transactions</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={notifications.transactionUpdates}
                    onChange={e => setNotifications({ ...notifications, transactionUpdates: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Limit Order Fills</p>
                    <p className="text-sm text-accent">Get notified when your limit orders are executed</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={notifications.limitOrderFills}
                    onChange={e => setNotifications({ ...notifications, limitOrderFills: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">DCA Executions</p>
                    <p className="text-sm text-accent">Receive notifications for DCA strategy executions</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={notifications.dcaExecutions}
                    onChange={e => setNotifications({ ...notifications, dcaExecutions: e.target.checked })}
                  />
                </div>
              </div>
            </Card>

            {/* Theme and Display Options */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Theme and Display</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme</label>
                  <div className="flex space-x-4">
                    <button
                      className={`btn ${theme === "light" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setTheme("light")}
                    >
                      Light
                    </button>
                    <button
                      className={`btn ${theme === "dark" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setTheme("dark")}
                    >
                      Dark
                    </button>
                    <button
                      className={`btn ${theme === "auto" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setTheme("auto")}
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* API Key Management */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">API Key Management</h2>
              <div className="space-y-4">
                <p className="text-sm text-accent">
                  Manage your 1inch API key for enhanced functionality and rate limits.
                </p>
                <div className="flex items-center space-x-4">
                  <input
                    type={showApiKey ? "text" : "password"}
                    className="input input-bordered flex-grow"
                    placeholder="Enter your 1inch API key"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                  />
                  <button className="btn btn-outline" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="text-sm text-accent">
                  <p>
                    • Get your API key from{" "}
                    <a href="https://portal.1inch.dev/" target="_blank" rel="noopener noreferrer" className="link">
                      1inch Portal
                    </a>
                  </p>
                  <p>• API key is stored locally and never shared</p>
                </div>
              </div>
            </Card>

            {/* Privacy and Security Settings */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Privacy and Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-accent">Help improve SwapPilot by sharing anonymous usage data</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={privacy.analytics}
                    onChange={e => setPrivacy({ ...privacy, analytics: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Crash Reports</p>
                    <p className="text-sm text-accent">Automatically send crash reports to help fix bugs</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={privacy.crashReports}
                    onChange={e => setPrivacy({ ...privacy, crashReports: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Share Data</p>
                    <p className="text-sm text-accent">Allow sharing of portfolio data for research purposes</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={privacy.shareData}
                    onChange={e => setPrivacy({ ...privacy, shareData: e.target.checked })}
                  />
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <button className="btn btn-primary flex-grow" onClick={handleSaveSettings}>
                  Save Settings
                </button>
                <button className="btn btn-outline" onClick={handleExportSettings}>
                  Export Settings
                </button>
                <button className="btn btn-error" onClick={handleResetSettings}>
                  Reset to Default
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
