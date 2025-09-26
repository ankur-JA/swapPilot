"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowsRightLeftIcon, ClockIcon, CalendarDaysIcon, ChartBarIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { Card } from "~~/components/swappilot";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const features = [
    {
      title: "Swap",
      description: "Trade tokens with the best rates using 1inch aggregation",
      icon: <ArrowsRightLeftIcon className="h-8 w-8 fill-primary" />,
      href: "/swap",
      color: "bg-primary/10",
    },
    {
      title: "Limit Orders",
      description: "Set price targets for your token swaps",
      icon: <ClockIcon className="h-8 w-8 fill-secondary" />,
      href: "/limit-orders",
      color: "bg-secondary/10",
    },
    {
      title: "DCA Scheduler",
      description: "Dollar-cost average your crypto investments",
      icon: <CalendarDaysIcon className="h-8 w-8 fill-accent" />,
      href: "/dca",
      color: "bg-accent/10",
    },
    {
      title: "Portfolio",
      description: "Track your crypto investments and performance",
      icon: <ChartBarIcon className="h-8 w-8 fill-success" />,
      href: "/portfolio",
      color: "bg-success/10",
    },
    {
      title: "Settings",
      description: "Configure your SwapPilot experience",
      icon: <Cog6ToothIcon className="h-8 w-8 fill-warning" />,
      href: "/settings",
      color: "bg-warning/10",
    },
  ];

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-center mb-4">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SwapPilot
              </span>
            </h1>
            <p className="text-xl text-accent mb-8 max-w-2xl mx-auto">
              Smart crypto swapping dashboard with advanced features for DeFi enthusiasts
            </p>
            
            {connectedAddress && (
              <div className="flex justify-center items-center space-x-2 flex-col mb-8">
                <p className="my-2 font-medium">Connected Address:</p>
                <Address address={connectedAddress} />
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Link href="/swap" className="btn btn-primary btn-lg">
                Start Swapping
              </Link>
              <Link href="/portfolio" className="btn btn-outline btn-lg">
                View Portfolio
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href} className="group">
                <Card className={`h-full transition-all duration-300 hover:scale-105 hover:shadow-xl ${feature.color}`}>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-accent">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-base-200 rounded-box p-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">5+</div>
                <div className="text-accent">Trading Features</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-2">1inch</div>
                <div className="text-accent">API Integration</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">Multi</div>
                <div className="text-accent">Protocol Support</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
            <p className="text-lg text-accent mb-8 max-w-2xl mx-auto">
              Connect your wallet and start swapping tokens with the best rates across multiple DEXs
            </p>
            <Link href="/swap" className="btn btn-primary btn-lg">
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
