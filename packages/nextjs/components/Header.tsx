"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import {
  ArrowsRightLeftIcon,
  Bars3Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { SwapPilotLogo } from "~~/components/swappilot";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Swap",
    href: "/swap",
    icon: <ArrowsRightLeftIcon className="h-5 w-5" />,
  },
  {
    label: "Limit Orders",
    href: "/limit-orders",
    icon: <ClockIcon className="h-5 w-5" />,
  },
  {
    label: "DCA",
    href: "/dca",
    icon: <CalendarDaysIcon className="h-5 w-5" />,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: <ChartBarIcon className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Cog6ToothIcon className="h-5 w-5" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-content shadow-lg"
                  : "text-base-content hover:bg-base-200 hover:text-primary"
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    setIsMobileMenuOpen(false);
  });

  return (
    <div className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <SwapPilotLogo size="md" showText={true} className="transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <ul className="flex items-center space-x-1">
              <HeaderMenuLinks />
            </ul>
          </nav>

          {/* Connect Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <RainbowKitCustomConnectButton />
              {isLocalNetwork && <FaucetButton />}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden" ref={burgerMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-base-200 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-base-300/50 bg-base-100/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <ul className="space-y-1">
                <HeaderMenuLinks />
              </ul>
              <div className="pt-4 border-t border-base-300/50">
                <RainbowKitCustomConnectButton />
                {isLocalNetwork && <FaucetButton />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
