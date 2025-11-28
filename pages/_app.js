import '../styles/globals.css'
import { Web3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { config, projectId } from '../web3modal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }) {
  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </WagmiProvider>

      <Web3Modal projectId={projectId} enableAnalytics={false} />
    </>
  )
}
