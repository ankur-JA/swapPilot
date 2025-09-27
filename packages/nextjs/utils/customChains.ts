import { defineChain } from "viem";

// ZkSync Era Mainnet
export const zkSyncEra = defineChain({
  id: 324,
  name: "ZkSync Era",
  nativeCurrency: { 
    name: "Ether", 
    symbol: "ETH", 
    decimals: 18 
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.era.zksync.io"],
    },
    public: {
      http: ["https://mainnet.era.zksync.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "zkSync Era Explorer",
      url: "https://explorer.zksync.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xF9cda624FBC7e059355ce98a31693d299FACd963",
    },
  },
});

// Binance Smart Chain (BSC) - using the standard BSC chain
export { bsc as binance } from "viem/chains";
