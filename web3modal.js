// web3modal.js

import { defaultWagmiConfig } from "@web3modal/wagmi";
import { createWeb3Modal } from "@web3modal/wagmi/react";

import { base } from "viem/chains";
import { http } from "wagmi";

// ===== YOUR NFT CONTRACT =====
export const CONTRACT_ADDRESS =
  "0x6a0DbB7e447B8f681afbe5ec8b1573e6FaFf7ba2";

// ===== YOUR REOWN PROJECT ID =====
export const projectId = "383e475c0afdbbbff941ef2b8febfabf";

// ===== METADATA =====
const metadata = {
  name: "JessePunk Mint",
  description: "Mint your JessePunk NFT",
  url: "https://d225.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"]
};

// ===== WAGMI CONFIG =====
export const config = defaultWagmiConfig({
  chains: [base],
  projectId,
  metadata,
  transports: {
    [base.id]: http()
  }
});

// ===== INIT WEB3MODAL =====
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains: [base]
});
