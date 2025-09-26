import { useMemo, useState } from "react";
import { Token } from "./TokenInput";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSelect: (token: Token) => void;
  selectedToken: Token | null;
}

// Hardcoded list of popular tokens
const POPULAR_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86a33E6441b8c4C8C0E4A0b86a33E6441b8c4C",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xa0b86a33e6441b8c4c8c0e4a0b86a33e6441b8c4c.png",
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
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 8,
    logoURI: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
  },
];

export const TokenSelectorModal = ({ isOpen, onClose, onTokenSelect, selectedToken }: TokenSelectorModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return POPULAR_TOKENS;

    return POPULAR_TOKENS.filter(
      token =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-base-100 rounded-box p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-base-content">Select Token</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* Token List */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-8 text-accent">No tokens found</div>
          ) : (
            filteredTokens.map(token => (
              <button
                key={token.address}
                onClick={() => onTokenSelect(token)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors ${
                  selectedToken?.address === token.address ? "bg-primary/10 border border-primary" : ""
                }`}
              >
                {token.logoURI && <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />}
                <div className="flex-1 text-left">
                  <div className="font-medium text-base-content">{token.symbol}</div>
                  <div className="text-sm text-accent">{token.name}</div>
                </div>
                {selectedToken?.address === token.address && <div className="text-primary">✓</div>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
