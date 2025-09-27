"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface Chain {
  id: number;
  name: string;
  symbol: string;
  logoURI: string;
  rpcUrl: string;
  blockExplorer: string;
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    symbol: "ETH",
    logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    rpcUrl: "https://eth.llamarpc.com",
    blockExplorer: "https://etherscan.io",
  },
  {
    id: 10,
    name: "Optimism",
    symbol: "ETH",
    logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    rpcUrl: "https://optimism.llamarpc.com",
    blockExplorer: "https://optimistic.etherscan.io",
  },
];

type ChainSelectorProps = {
  selectedChain: Chain;
  onChainSelect: (chain: Chain) => void;
  className?: string;
};

export const ChainSelector = ({ selectedChain, onChainSelect, className = "" }: ChainSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChainSelect = (chain: Chain) => {
    onChainSelect(chain);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button className="btn btn-outline gap-2 w-full justify-between" onClick={() => setIsOpen(!isOpen)} type="button">
        <div className="flex items-center gap-2">
          <img src={selectedChain.logoURI} alt={selectedChain.name} className="h-5 w-5 rounded-full" />
          <span className="font-medium">{selectedChain.name}</span>
        </div>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-300 rounded-box shadow-lg z-50">
          <div className="p-2">
            {SUPPORTED_CHAINS.map(chain => (
              <button
                key={chain.id}
                className={`flex items-center gap-3 p-3 w-full hover:bg-base-200 rounded-lg transition-colors ${
                  selectedChain.id === chain.id ? "bg-primary/10" : ""
                }`}
                onClick={() => handleChainSelect(chain)}
              >
                <img src={chain.logoURI} alt={chain.name} className="h-6 w-6 rounded-full" />
                <div className="text-left">
                  <p className="font-medium text-base-content">{chain.name}</p>
                  <p className="text-sm text-accent-content">Chain ID: {chain.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};
