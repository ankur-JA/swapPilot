"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowsRightLeftIcon, BoltIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              {/* Main Heading */}
              <div className="mb-8">
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    SwapPilot
                  </span>
                </h1>
                <p className="text-2xl md:text-3xl font-semibold text-base-content/80 mb-4">
                  The Smartest Way to Swap Crypto
                </p>
                <p className="text-lg md:text-xl text-base-content/60 max-w-3xl mx-auto leading-relaxed">
                  Get the best rates, set smart orders, and grow your portfolio with our intelligent DeFi platform. No
                  complexity, just results.
                </p>
              </div>

              {/* Connection Status */}
              {connectedAddress && (
                <div className="mb-8 p-4 bg-success/10 border border-success/20 rounded-2xl inline-block">
                  <p className="text-success font-medium mb-2">✓ Wallet Connected</p>
                  <Address address={connectedAddress} />
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  href="/swap"
                  className="btn btn-primary btn-lg px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowsRightLeftIcon className="h-6 w-6 mr-2" />
                  Start Swapping Now
                </Link>
                <Link
                  href="/portfolio"
                  className="btn btn-outline btn-lg px-8 py-4 text-lg font-semibold rounded-2xl border-2 hover:scale-105 transition-all duration-300"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-primary">SwapPilot</span>?
            </h2>
            <p className="text-xl text-base-content/60 max-w-2xl mx-auto">
              Built for modern DeFi users who want simplicity without sacrificing power
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-base-100 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <SparklesIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Best Rates Guaranteed</h3>
              <p className="text-base-content/60 leading-relaxed">
                Our smart routing finds the best prices across all major DEXs automatically. Save money on every swap.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-base-100 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <BoltIcon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-base-content/60 leading-relaxed">
                Execute swaps in seconds with our optimized infrastructure. No waiting, no delays, just instant results.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-base-100 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <ShieldCheckIcon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure & Trusted</h3>
              <p className="text-base-content/60 leading-relaxed">
                Your funds stay in your wallet. We never hold your tokens. Built with security-first principles.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-base-200 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="text-xl text-base-content/60 max-w-2xl mx-auto">
                Three simple steps to start trading smarter
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-content">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4">Connect Wallet</h3>
                <p className="text-base-content/60">
                  Link your MetaMask, WalletConnect, or other supported wallet in seconds
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-accent-content">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4">Choose Tokens</h3>
                <p className="text-base-content/60">Select what you want to swap and get the best rate instantly</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-secondary-content">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4">Execute Swap</h3>
                <p className="text-base-content/60">Confirm the transaction and watch your tokens swap in real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Trade <span className="text-primary">Smarter</span>?
            </h2>
            <p className="text-xl text-base-content/60 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already saving money and time with SwapPilot
            </p>
            <Link
              href="/swap"
              className="btn btn-primary btn-lg px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
