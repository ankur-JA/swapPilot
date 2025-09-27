"use client";

import type { NextPage } from "next";
import { Card } from "~~/components/swappilot";

const SettingsPage: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Settings</span>
            <span className="block text-lg text-accent mt-2">Configure your SwapPilot experience</span>
          </h1>

          <Card>
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <p className="text-accent text-lg">
                Settings and configuration options will be built here. This feature will allow you to customize your
                SwapPilot experience.
              </p>
              <div className="mt-8 space-y-2 text-sm text-base-content/70">
                <p>• Slippage tolerance settings</p>
                <p>• Default token preferences</p>
                <p>• Notification preferences</p>
                <p>• Theme and display options</p>
                <p>• API key management</p>
                <p>• Privacy and security settings</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
