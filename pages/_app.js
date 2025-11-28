import '../styles/globals.css'
import { Web3Modal } from '@web3modal/ethers/react'
import { projectId } from '../web3modal'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Web3Modal projectId={projectId} />
    </>
  )
}
