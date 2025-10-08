import type { NetworkSettings } from '../../core/environment.js'
import { Contract, parseEther } from 'ethers'
import dexRouterAbi from '../../contracts/dex-router.js'

interface ExecutionContext { 
  signerWallet: any
  rpcProvider: any
  console: any
  simulationMode: boolean
  settings: NetworkSettings 
}

export class RouteManager {
  private readonly context: ExecutionContext
  
  constructor(ctx: ExecutionContext) { 
    this.context = ctx 
  }

  async execute(configurationPath: string) {
    const parameters = await this.loadParameters(configurationPath)
    
    for (const routeItem of parameters.routeSequence ?? []) {
      await this.processRoute(routeItem)
    }
  }

  private async processRoute(routeItem: any) {
    const { settings, signerWallet, console } = this.context
    const dexRouter: any = new Contract(settings.DEX_ROUTER_CONTRACT, dexRouterAbi, signerWallet)
    const transactionDeadline = Math.floor(Date.now() / 1000) + (routeItem.deadlineSeconds ?? 300)
    
    if (routeItem.operationType === 'acquire') {
      const inputValue = parseEther(routeItem.nativeAmount)
      const estimatedAmounts: bigint[] = await dexRouter.getAmountsOut(
        inputValue, 
        [settings.WRAPPED_NATIVE_TOKEN, routeItem.tokenContract]
      )
      
      const minimumOutput = estimatedAmounts[1]! - 
        (estimatedAmounts[1]! * BigInt(routeItem.slippageTolerance ?? 800)) / BigInt(10_000)
      
      console.info({ routeItem }, 'route manager acquisition')
      
      if (this.context.simulationMode) return
      
      const transaction = await dexRouter.swapExactETHForTokens(
        minimumOutput, 
        [settings.WRAPPED_NATIVE_TOKEN, routeItem.tokenContract], 
        signerWallet.address, 
        transactionDeadline, 
        { value: inputValue }
      )
      
      await transaction.wait()
    }
  }

  private async loadParameters(filePath: string) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const resolvedPath = path.resolve(process.cwd(), filePath)
    return JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'))
  }
}

