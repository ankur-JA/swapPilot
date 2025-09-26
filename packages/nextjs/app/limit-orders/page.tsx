"use client";

import type { NextPage } from "next";
import { Card } from "~~/components/swappilot";

const LimitOrdersPage: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Limit Orders</span>
            <span className="block text-lg text-accent mt-2">Set price targets for your swaps</span>
          </h1>

          <Card>
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <p className="text-accent text-lg">
                Limit order functionality will be built here. This feature will allow you to set specific price targets
                for your token swaps.
              </p>
              <div className="mt-8 space-y-2 text-sm text-base-content/70">
                <p>• Set buy/sell orders at target prices</p>
                <p>• Automatic execution when conditions are met</p>
                <p>• Advanced order types and strategies</p>
                <p>• Order history and management</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LimitOrdersPage;
