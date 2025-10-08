import { Contract, parseEther } from 'ethers'
import dexRouterAbi from '../../contracts/dex-router.js'
import tokenAbi from '../../contracts/token-interface.js'
import type { NetworkSettings } from '../../core/environment.js'
import { MessengerService } from '../../core/messenger.js'

interface ExecutionContext {
  signerWallet: any
  rpcProvider: any
  console: any
  simulationMode: boolean
  settings: NetworkSettings
}

export class LaunchScanner {
  private readonly context: ExecutionContext
  
  constructor(ctx: ExecutionContext) { 
    this.context = ctx 
  }

  async execute(configurationPath: string) {
    const parameters = await this.loadParameters(configurationPath)
    
    for (const target of parameters.targetList ?? []) {
      await this.acquireToken(
        target.tokenContract, 
        target.maxNativeAmount ?? '0.05', 
        target.slippageTolerance ?? 800
      )
    }
  }

  private async acquireToken(
    tokenContract: string, 
    maxNativeAmount: string, 
    slippageTolerance: number
  ) {
    const { settings, signerWallet, console } = this.context
    const dexRouter: any = new Contract(settings.DEX_ROUTER_CONTRACT, dexRouterAbi, signerWallet)
    const swapPath = [settings.WRAPPED_NATIVE_TOKEN, tokenContract]
    const inputValue = parseEther(maxNativeAmount)
    const transactionDeadline = Math.floor(Date.now() / 1000) + 180

    const estimatedAmounts: bigint[] = await dexRouter.getAmountsOut(inputValue, swapPath)
    
    if (estimatedAmounts.length < 2) {
      throw new Error('Invalid swap path or insufficient liquidity detected')
    }
    
    const expectedOutput: bigint = estimatedAmounts[estimatedAmounts.length - 1]!
    const minimumOutput = expectedOutput - (expectedOutput * BigInt(slippageTolerance)) / BigInt(10_000)

    console.info({ 
      tokenContract, 
      maxNativeAmount, 
      minimumOutput: minimumOutput.toString() 
    }, 'launch scanner acquisition')
    
    const messenger = new MessengerService({ 
      botToken: this.context.settings.ALERT_BOT_TOKEN, 
      chatIdentifier: this.context.settings.ALERT_CHAT_IDENTIFIER 
    })
    
    await messenger.sendAlert(
      `🟢 Launch Scanner Acquisition\nToken: <code>${tokenContract}</code>\nSpend: ${maxNativeAmount} BNB`
    )
    
    if (this.context.simulationMode) return

    const transaction = await dexRouter.swapExactETHForTokens(
      minimumOutput, 
      swapPath, 
      signerWallet.address, 
      transactionDeadline, 
      { value: inputValue }
    )
    
    console.info({ hash: transaction.hash }, 'launch scanner transaction dispatched')
    await transaction.wait()
    await messenger.sendAlert(
      `✅ Acquisition Confirmed\nTx: <code>${transaction.hash}</code>`
    )
  }

  private async loadParameters(filePath: string) {
    const fs = await import('fs')
    const path = await import('path')
    const resolvedPath = path.resolve(process.cwd(), filePath)
    return JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'))
  }
}

