import { Command } from 'commander'
import { initializeEnvironment } from './core/environment.js'
import { initializeConsole } from './core/console.js'
import { initializeBlockchainConnection } from './core/blockchain.js'
import { LaunchScanner } from './strategies/launch-scanner/LaunchScanner.js'
import { MirrorExecutor } from './strategies/mirror-executor/MirrorExecutor.js'
import { RouteManager } from './strategies/route-manager/RouteManager.js'
import { LiquiditySimulator } from './strategies/liquidity-simulator/LiquiditySimulator.js'

const application = new Command()

application
  .name('nexus-dex')
  .description('Nexus DEX Automation - Advanced trading toolkit for BNB Chain')
  .version('2.0.0')

application
  .command('launch-scan')
  .description('Execute launch scanner for new token deployments')
  .option('-p, --parameters <path>', 'Path to parameters file', 'scanner.parameters.json')
  .option('--simulate', 'Run in simulation mode without broadcasting transactions', false)
  .action(async (options) => {
    const settings = initializeEnvironment()
    const console = initializeConsole(settings.CONSOLE_LOG_LEVEL)
    const { signerWallet, rpcProvider } = initializeBlockchainConnection(settings)
    const scanner = new LaunchScanner({ 
      signerWallet, 
      rpcProvider, 
      console, 
      simulationMode: options.simulate, 
      settings 
    })
    await scanner.execute(options.parameters)
  })

application
  .command('mirror-trade')
  .description('Execute mirror trading against monitored wallets')
  .option('-p, --parameters <path>', 'Path to parameters file', 'mirror.parameters.json')
  .option('--simulate', 'Run in simulation mode without broadcasting transactions', false)
  .action(async (options) => {
    const settings = initializeEnvironment()
    const console = initializeConsole(settings.CONSOLE_LOG_LEVEL)
    const { signerWallet, rpcProvider } = initializeBlockchainConnection(settings)
    const executor = new MirrorExecutor({ 
      signerWallet, 
      rpcProvider, 
      console, 
      simulationMode: options.simulate, 
      settings 
    })
    await executor.execute(options.parameters)
  })

application
  .command('manage-routes')
  .description('Execute route manager for batch operations')
  .option('-p, --parameters <path>', 'Path to parameters file', 'routes.parameters.json')
  .option('--simulate', 'Run in simulation mode without broadcasting transactions', false)
  .action(async (options) => {
    const settings = initializeEnvironment()
    const console = initializeConsole(settings.CONSOLE_LOG_LEVEL)
    const { signerWallet, rpcProvider } = initializeBlockchainConnection(settings)
    const manager = new RouteManager({ 
      signerWallet, 
      rpcProvider, 
      console, 
      simulationMode: options.simulate, 
      settings 
    })
    await manager.execute(options.parameters)
  })

application
  .command('simulate-liquidity')
  .description('Execute liquidity simulator with periodic buy/sell cycles')
  .option('-p, --parameters <path>', 'Path to parameters file', 'liquidity.parameters.json')
  .option('--simulate', 'Run in simulation mode without broadcasting transactions', false)
  .action(async (options) => {
    const settings = initializeEnvironment()
    const console = initializeConsole(settings.CONSOLE_LOG_LEVEL)
    const { signerWallet, rpcProvider } = initializeBlockchainConnection(settings)
    const simulator = new LiquiditySimulator({ 
      signerWallet, 
      rpcProvider, 
      console, 
      simulationMode: options.simulate, 
      settings 
    })
    await simulator.execute(options.parameters)
  })

await application.parseAsync(process.argv)

