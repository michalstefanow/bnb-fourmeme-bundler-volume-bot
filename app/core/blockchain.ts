import { JsonRpcProvider, Wallet } from 'ethers'
import type { NetworkSettings } from './environment.js'

export function initializeBlockchainConnection(settings: NetworkSettings) {
  const rpcProvider = new JsonRpcProvider(
    settings.NETWORK_ENDPOINT, 
    settings.NETWORK_CHAIN_ID, 
    { staticNetwork: true }
  )
  const signerWallet = new Wallet(settings.WALLET_PRIVATE_KEY, rpcProvider)
  
  return { 
    rpcProvider, 
    signerWallet 
  }
}

