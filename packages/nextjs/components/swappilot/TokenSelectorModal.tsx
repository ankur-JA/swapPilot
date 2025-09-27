"use client";

import { useState, ChangeEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Token } from "./TokenInput";

type TokenSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  selectedToken?: Token | null;
};

// Hardcoded popular tokens for now
const POPULAR_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2260FAC549599087599fE8Bc6f2bA069b66Cc2f4",
    decimals: 8,
    logoURI: "https://tokens.1inch.io/0x2260fac549599087599fe8bc6f2ba069b66cc2f4.png",
  },
];

export const TokenSelectorModal = ({ isOpen, onClose, onSelectToken, selectedToken }: TokenSelectorModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTokens = POPULAR_TOKENS.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-base-100 rounded-box p-6 w-full max-w-md shadow-xl relative">
        <button onClick={onClose} className="btn btn-sm btn-circle absolute right-3 top-3">
          <XMarkIcon className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Select Token</h2>

        <input
          type="text"
          placeholder="Search token by symbol or name"
          className="input input-bordered w-full mb-4"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />

        <div className="max-h-80 overflow-y-auto">
          {filteredTokens.length === 0 ? (
            <p className="text-center text-accent">No tokens found.</p>
          ) : (
            <ul className="space-y-2">
              {filteredTokens.map(token => (
                <li key={token.address}>
                  <button
                    className="flex items-center gap-3 p-2 w-full hover:bg-base-200 rounded-lg transition-colors"
                    onClick={() => onSelectToken(token)}
                  >
                    {token.logoURI && (
                      <img src={token.logoURI} alt={token.symbol} className="h-8 w-8 rounded-full" />
                    )}
                    <div>
                      <p className="font-semibold">{token.symbol}</p>
                      <p className="text-sm text-accent-content">{token.name}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};