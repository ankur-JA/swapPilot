"use client";

import type { NextPage } from "next";
import { Card } from "~~/components/swappilot";

const DCAPage: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">DCA Scheduler</span>
            <span className="block text-lg text-accent mt-2">Dollar Cost Average your crypto investments</span>
          </h1>

          <Card>
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <p className="text-accent text-lg">
                DCA (Dollar Cost Averaging) functionality will be built here. This feature will allow you to schedule
                regular, automated token purchases.
              </p>
              <div className="mt-8 space-y-2 text-sm text-base-content/70">
                <p>• Schedule recurring token purchases</p>
                <p>• Set custom intervals (daily, weekly, monthly)</p>
                <p>• Manage multiple DCA strategies</p>
                <p>• Track performance and history</p>
                <p>• Pause, modify, or cancel strategies</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DCAPage;
