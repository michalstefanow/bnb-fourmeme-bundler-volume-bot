# Nexus DEX Automation (BNB Chain)

Advanced automation toolkit for decentralized exchange operations on BNB Chain. Features launch scanner, mirror executor, route manager, and liquidity simulator. Fully on-chain implementation with no third-party APIs, CLI-driven workflow, and enterprise-grade safety controls.

## Contact to developer

- if you have any question for developer of this project, contact via [telegram](https://t.me/mooneagle1_1) or whatsApp - +44 7832607596

## Core Capabilities

- **Launch Scanner**: Rapid acquisition of newly deployed tokens with configurable slippage and deadline management
- **Mirror Executor**: Real-time replication of monitored wallet activities with proportional sizing and exposure caps
- **Route Manager**: Batch execution of swap routes with multicall support and precise timing controls
- **Liquidity Simulator**: Automated buy/sell cycles with rate limiting for market testing and liquidity generation
- **Alert System**: Optional Telegram notifications for critical operations
- **Safety Features**: Configurable limits, simulation mode, and MEV-resistant settings

## Architecture Overview

### Launch Scanner Workflow

Load target list from parameters → Estimate output via DEX router → Apply slippage tolerance → Execute `WRAPPED_NATIVE→TOKEN` swap → Report transaction → Optional alert notification.

### Mirror Executor Workflow

Monitor pending transactions → Filter by watched wallets → Detect DEX router interactions → Execute proportional position entry → Send alert notification.

### Route Manager Workflow

Parse route sequence → Execute each route operation (acquisition phase, extensible for multicalls) → Apply deadline and slippage constraints.

### Liquidity Simulator Workflow

Interval-based loop → Execute small acquisition → Approve if necessary → Liquidate partial/complete position → Repeat with rate limiting.

## Getting Started

### System Requirements

- Node.js >= 18.17
- BNB Chain RPC endpoint
- Funded wallet with private key

### Installation

```bash
npm install
```

### Configuration

Copy `settings.env.template` to `.env` and configure with your values. PancakeSwap V2 and WBNB mainnet addresses are pre-configured. For Telegram notifications:

```
ALERT_BOT_TOKEN=123:ABC
ALERT_CHAT_IDENTIFIER=123456789
```

Parameter files (use provided templates):
- `scanner.parameters.json`
- `mirror.parameters.json`
- `routes.parameters.json`
- `liquidity.parameters.json`

### Build & Execution

```bash
npm run build

# Launch Scanner
node build/cli.js launch-scan -p scanner.parameters.json --simulate

# Mirror Executor
node build/cli.js mirror-trade -p mirror.parameters.json

# Route Manager
node build/cli.js manage-routes -p routes.parameters.json

# Liquidity Simulator
node build/cli.js simulate-liquidity -p liquidity.parameters.json
```

## Strategy Configuration Guide

- Always test with `--simulate` flag before live deployment
- Start with conservative position sizes and gradually increase
- Verify all token and router contract addresses
- Launch Scanner: 300–800 basis points slippage is typical for volatile launches
- Mirror Executor: Set per-operation caps and monitor overall daily exposure

## Technical Support

- Contact: Professional trading solutions inquiry channel
- Email: Technical support for enterprise deployments

## Security Guidelines

- Never commit credentials to version control
- Use dedicated hot wallet with limited funds
- Verify all smart contract addresses before operations
- Always begin with simulation mode and minimal position sizes
- Enable proper monitoring and alerting systems

## Advanced Features

- Configurable gas price strategies
- Multi-wallet support for distributed execution
- Custom slippage curves based on liquidity depth
- Integration with multiple DEX protocols
- Comprehensive transaction analytics and reporting

## License

MIT License - See LICENSE file for details

---

**Disclaimer**: This software is provided for educational and research purposes. Users are solely responsible for compliance with applicable laws and regulations. Trading cryptocurrencies carries substantial risk of loss.
