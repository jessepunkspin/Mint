import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { base } from 'wagmi/chains'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { reconnect, http } from 'wagmi'
import { cookieStorage, createStorage } from 'wagmi'

// === YOUR CONTRACT ===
export const CONTRACT_ADDRESS = "0x6a0DbB7e447B8f681afbe5ec8b1573e6FaFf7ba2";

// === YOUR WEB3MODAL PROJECT ID ===
export const projectId = "383e475c0afdbbbff941ef2b8febfabf";

// === REQUIRED METADATA ===
const metadata = {
  name: "JessePunk Mint",
  description: "Mint your JessePunk NFT",
  url: "https://d225.vercel.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"]
};

// === WAGMI CONFIG ===
export const config = defaultWagmiConfig({
  chains: [base],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [base.id]: http()
  }
});

// === INIT MODAL ===
createWeb3Modal({
  wagmiConfig: config,
  chains: [base],
  projectId
});

// reconnect automatically
reconnect(config);
