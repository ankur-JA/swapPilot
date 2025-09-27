import { useState } from "react";
import { TokenSelectorModal } from "./TokenSelectorModal";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
}

interface TokenInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
}

export const TokenInput = ({
  value,
  onChange,
  selectedToken,
  onTokenSelect,
  placeholder = "0.0",
  disabled = false,
  readOnly = false,
  label,
}: TokenInputProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-base-content">{label}</label>}

      <div className="flex border-2 border-base-300 bg-base-200 rounded-full text-accent">
        {/* Amount Input */}
        <input
          className={`input input-ghost focus-within:border-transparent focus:outline-hidden focus:bg-transparent h-[2.2rem] min-h-[2.2rem] px-4 border-0 w-full font-medium placeholder:text-accent/70 ${
            readOnly ? "text-base-content/50 cursor-not-allowed" : "text-base-content/70 focus:text-base-content/70"
          }`}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete="off"
          type="number"
        />

        {/* Token Selector Button */}
        <button
          type="button"
          className="btn btn-primary h-[2.2rem] min-h-[2.2rem] rounded-l-none border-l border-base-300"
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedToken ? (
              <>
                {selectedToken.logoURI && (
                  <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />
                )}
                <span className="font-medium">{selectedToken.symbol}</span>
              </>
            ) : (
              <span className="font-medium">Select Token</span>
            )}
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Token Selector Modal */}
      <TokenSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTokenSelect={handleTokenSelect}
        selectedToken={selectedToken}
      />
    </div>
  );
};
