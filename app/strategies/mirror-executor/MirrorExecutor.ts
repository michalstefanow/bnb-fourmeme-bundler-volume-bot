import type { NetworkSettings } from '../../core/environment.js'
import { Contract, parseEther } from 'ethers'
import dexRouterAbi from '../../contracts/dex-router.js'
import { MessengerService } from '../../core/messenger.js'

interface ExecutionContext { 
  signerWallet: any
  rpcProvider: any
  console: any
  simulationMode: boolean
  settings: NetworkSettings 
}

export class MirrorExecutor {
  private readonly context: ExecutionContext
  
  constructor(ctx: ExecutionContext) { 
    this.context = ctx 
  }

  async execute(configurationPath: string) {
    const parameters = await this.loadParameters(configurationPath)
    this.context.console.info('Initializing mirror executor service...')

    this.context.rpcProvider.on('pending', async (txHash: string) => {
      try {
        const pendingTx = await this.context.rpcProvider.getTransaction(txHash)
        if (!pendingTx || !pendingTx.to) return
        
        const isTargetWallet = parameters.watchList?.some(
          (addr: string) => addr.toLowerCase() === pendingTx.from?.toLowerCase()
        )
        
        if (!isTargetWallet) return

        // Detect DEX router interaction and mirror trade with proportional sizing
        if (pendingTx.to.toLowerCase() === this.context.settings.DEX_ROUTER_CONTRACT.toLowerCase()) {
          const proportionPercent = parameters.positionRatio ?? 10
          const calculatedSpend = (
            BigInt(parseEther(parameters.maxNativePerOperation ?? '0.05')) * 
            BigInt(proportionPercent)
          ) / BigInt(100)
          
          await this.replicateTrade(parameters.primaryToken, calculatedSpend)
          
          const messenger = new MessengerService({ 
            botToken: this.context.settings.ALERT_BOT_TOKEN, 
            chatIdentifier: this.context.settings.ALERT_CHAT_IDENTIFIER 
          })
          
          await messenger.sendAlert(
            `📣 Mirrored operation from <code>${pendingTx.from}</code>`
          )
        }
      } catch {}
    })
  }

  private async replicateTrade(tokenContract: string, amountInWei: bigint) {
    const { settings, signerWallet, console } = this.context
    const dexRouter: any = new Contract(settings.DEX_ROUTER_CONTRACT, dexRouterAbi, signerWallet)
    const swapPath = [settings.WRAPPED_NATIVE_TOKEN, tokenContract]
    const transactionDeadline = Math.floor(Date.now() / 1000) + 180
    
    const estimatedAmounts: bigint[] = await dexRouter.getAmountsOut(amountInWei, swapPath)
    const minimumOutput = estimatedAmounts[estimatedAmounts.length - 1]! - 
      (estimatedAmounts[estimatedAmounts.length - 1]! * BigInt(700)) / BigInt(10_000)
    
    console.debug({ 
      tokenContract, 
      amountInWei: amountInWei.toString() 
    }, 'mirror trade execution')
    
    if (this.context.simulationMode) return
    
    const transaction = await dexRouter.swapExactETHForTokens(
      minimumOutput, 
      swapPath, 
      signerWallet.address, 
      transactionDeadline, 
      { value: amountInWei }
    )
    
    await transaction.wait()
  }

  private async loadParameters(filePath: string) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const resolvedPath = path.resolve(process.cwd(), filePath)
    return JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'))
  }
}

