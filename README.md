# FourMeme Trading Bot (BNB Chain)

Modular trading toolkit for the Four.meme ecosystem on BNB Chain. Includes sniper, copy‑trader, bundler, and volume bots with on‑chain integration (no third‑party data APIs), CLI, and risk controls.

## Features
- Sniper: buy new launches fast with slippage control
- Copy‑trader: mirror selected wallets with position sizing
- Bundler: batch/multicall routes (e.g., WBNB→TOKEN)
- Volume bot: rate‑limited buys/sells for organic volume tests
- Risk controls: slippage, max cost, allow/deny lists
- MEV‑aware: priority fee tuning, basic anti‑sandwich options
- Ethers v6, TypeScript, ESM

## Quick Start

### Prerequisites
- Node.js >= 18.17
- BNB RPC URL
- Wallet private key (funded)

### Install
```bash
npm install
```

### Configure
Copy `env.example` to `.env` and fill values. Common PancakeSwap V2/WBNB mainnet defaults are included.

Create a config, or use the examples:
- `config.sniper.example.json`
- `config.copy.example.json`
- `config.bundle.example.json`
- `config.volume.example.json`

### Build & Run
```bash
npm run build
node dist/index.js sniper -c config.sniper.example.json --dry-run
node dist/index.js copy -c config.copy.example.json
node dist/index.js bundle -c config.bundle.example.json
node dist/index.js volume -c config.volume.example.json
```

## Security
- Never commit secrets
- Use a dedicated hot wallet
- Verify token/router addresses
- Start with dry‑run and small sizes

## Suggested Topics
`bnb-chain`, `fourmeme`, `memecoin`, `trading-bot`, `sniper-bot`, `copy-trading`, `bundle-transactions`, `market-making`, `pancakeswap`, `ethers`, `typescript`, `mev-protection`, `web3`, `automation`

## License
MIT


