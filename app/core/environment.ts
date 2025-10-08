import dotenv from 'dotenv'

dotenv.config()

export interface NetworkSettings {
  NETWORK_ENDPOINT: string
  WALLET_PRIVATE_KEY: string
  NETWORK_CHAIN_ID: number
  CONSOLE_LOG_LEVEL: 'info' | 'debug' | 'error'
  WRAPPED_NATIVE_TOKEN: string
  DEX_ROUTER_CONTRACT: string
  ALERT_BOT_TOKEN?: string
  ALERT_CHAT_IDENTIFIER?: string
}

export function initializeEnvironment(): NetworkSettings {
  const {
    NETWORK_ENDPOINT,
    WALLET_PRIVATE_KEY,
    NETWORK_CHAIN_ID = '56',
    CONSOLE_LOG_LEVEL = 'info',
    WRAPPED_NATIVE_TOKEN = '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    DEX_ROUTER_CONTRACT = '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    ALERT_BOT_TOKEN,
    ALERT_CHAT_IDENTIFIER
  } = process.env

  if (!NETWORK_ENDPOINT) throw new Error('NETWORK_ENDPOINT must be configured')
  if (!WALLET_PRIVATE_KEY) throw new Error('WALLET_PRIVATE_KEY must be configured')

  return {
    NETWORK_ENDPOINT,
    WALLET_PRIVATE_KEY,
    NETWORK_CHAIN_ID: Number(NETWORK_CHAIN_ID),
    CONSOLE_LOG_LEVEL: CONSOLE_LOG_LEVEL as NetworkSettings['CONSOLE_LOG_LEVEL'],
    WRAPPED_NATIVE_TOKEN,
    DEX_ROUTER_CONTRACT,
    ALERT_BOT_TOKEN,
    ALERT_CHAT_IDENTIFIER
  }
}

