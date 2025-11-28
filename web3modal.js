import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const base = {
  chainId: 8453,
  name: 'Base',
  currency: 'ETH',
  explorerUrl: 'https://basescan.org',
  rpcUrl: 'https://mainnet.base.org'
}

const metadata = {
  name: "JessePunk Mint",
  description: "Mint your JessePunk NFT",
  url: "https://andy.vercel.app/",
  icons: ["https://andy.vercel.app/jessepunk.png"]
}

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [base],
  projectId: "7e1f9ec7320fb75ac22b9e69dbbcc4ec"
});
