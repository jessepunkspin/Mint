import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

export const projectId = "383e475c0afdbbbff941ef2b8febfabf";

export const config = defaultConfig({
  projectId,
  metadata: {
    name: 'JessePunk Mint',
    description: 'Mint JessePunk NFT',
    url: 'https://jessepunk.vercel.app',
    icons: ['https://i.imgur.com/5cX9Z4P.png']
  }
});

createWeb3Modal({
  ethersConfig: config,
  projectId
});
