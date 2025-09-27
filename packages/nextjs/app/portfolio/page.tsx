"use client";

import type { NextPage } from "next";
import { Card } from "~~/components/swappilot";

const PortfolioPage: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Portfolio</span>
            <span className="block text-lg text-accent mt-2">Track your crypto investments and performance</span>
          </h1>

          <Card>
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <p className="text-accent text-lg">
                Portfolio tracking functionality will be built here. This feature will provide comprehensive analytics
                and insights for your crypto investments.
              </p>
              <div className="mt-8 space-y-2 text-sm text-base-content/70">
                <p>• Real-time portfolio valuation</p>
                <p>• Performance analytics and charts</p>
                <p>• Transaction history and P&L tracking</p>
                <p>• Asset allocation and diversification insights</p>
                <p>• Export portfolio data and reports</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PortfolioPage;
