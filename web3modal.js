import { defaultConfig, createWeb3Modal } from "@web3modal/ethers/react";
import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x6a0DbB7e447B8f681afbe5ec8b1573e6FaFf7ba2";

export const projectId = "383e475c0afdbbbff941ef2b8febfabf";

const metadata = {
  name: "JessePunk Mint",
  description: "Mint your JessePunk NFT",
  url: "https://d225.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"]
};

export const config = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true
});

// Init Web3Modal
createWeb3Modal({
  ethersConfig: config,
  chains: [
    {
      chainId: 8453,
      name: "Base",
      currency: "ETH",
      explorerUrl: "https://basescan.org",
      rpcUrl: "https://mainnet.base.org"
    }
  ],
  projectId
});
