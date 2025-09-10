# FourMeme Trading Bot (BNB Chain)

Modular trading toolkit for the Four.meme ecosystem on BNB Chain. Ships with sniper, copy‑trader, bundler, and volume bots. Fully on‑chain (no third‑party data APIs), CLI‑driven, and built with strict risk controls.

## What it does
- Sniper: buy new launches fast with slippage and deadline control
- Copy‑trader: mirror selected wallets (size %, caps, dedupe per tx)
- Bundler: batch routes/multicalls (e.g., WBNB→TOKEN) with timing
- Volume bot: cadence‑based buy/sell loops for liquidity/organic tests
- Notifications: optional Telegram alerts on key actions
- Safety: allow/deny lists, max spend, basic MEV‑aware settings

## How it works (workflows)

1) Sniper
- Load targets from config → estimate out via router → apply slippage → swap `WBNB→TOKEN` → report tx/receipt → optional Telegram alert.

2) Copy‑Trader
- Subscribe to pending tx → filter by leader wallets → detect router calls → mirror entry with your sizing → alert.

3) Bundler
- Read route list → for each route execute (buy legs now, extendable to multicall) → respect deadlines/slippage.

4) Volume Bot
- Interval loop → buy small size → approve if needed → sell fraction/ALL → repeat with rate limits.

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
Copy `env.example` to `.env` and fill values (PancakeV2/WBNB mainnet defaults included). Optional Telegram notifications:
```
TELEGRAM_BOT_TOKEN=123:ABC
TELEGRAM_CHAT_ID=123456789
```

Configs (use examples):
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

## Bot configuration tips
- Start with dry‑run; ramp sizes slowly.
- Use deny lists and verify token/router addresses.
- Sniper: 300–800 bips slippage is common in fast markets.
- Copy‑trader: cap per trade and overall daily exposure.

## Telegram Contact
- Contact: t.me/@lorine93s

## Security
- Never commit secrets
- Use a dedicated hot wallet
- Verify token/router addresses
- Start with dry‑run and small sizes

