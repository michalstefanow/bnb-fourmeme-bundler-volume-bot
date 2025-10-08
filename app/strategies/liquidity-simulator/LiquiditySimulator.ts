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

export class LiquiditySimulator {
  private readonly context: ExecutionContext
  private intervalTimer: NodeJS.Timeout | null = null
  
  constructor(ctx: ExecutionContext) { 
    this.context = ctx 
  }

  async execute(configurationPath: string) {
    const parameters = await this.loadParameters(configurationPath)
    const cycleIntervalMs = parameters.cycleDelayMs ?? 15_000
    const targetToken = parameters.tokenContract
    const nativeAmount = parameters.nativeAmount ?? '0.01'
    const slippageTolerance = parameters.slippageTolerance ?? 800

    this.terminate()
    this.intervalTimer = setInterval(async () => {
      try {
        await this.executeCycle(targetToken, nativeAmount, slippageTolerance)
      } catch (error) {
        this.context.console.error({ error }, 'liquidity cycle error')
      }
    }, cycleIntervalMs)
  }

  terminate() {
    if (this.intervalTimer) clearInterval(this.intervalTimer)
    this.intervalTimer = null
  }

  private async executeCycle(
    tokenContract: string, 
    nativeAmount: string, 
    slippageTolerance: number
  ) {
    const { settings, signerWallet, console } = this.context
    const dexRouter: any = new Contract(settings.DEX_ROUTER_CONTRACT, dexRouterAbi, signerWallet)
    const transactionDeadline = Math.floor(Date.now() / 1000) + 180

    // Acquisition phase
    const inputValue = parseEther(nativeAmount)
    const estimatedAcquire: bigint[] = await dexRouter.getAmountsOut(
      inputValue, 
      [settings.WRAPPED_NATIVE_TOKEN, tokenContract]
    )
    
    const minimumAcquire = estimatedAcquire[1]! - 
      (estimatedAcquire[1]! * BigInt(slippageTolerance)) / BigInt(10_000)
    
    console.debug({ tokenContract, nativeAmount }, 'liquidity simulator acquire')
    
    if (!this.context.simulationMode) {
      const acquireTx = await dexRouter.swapExactETHForTokens(
        minimumAcquire, 
        [settings.WRAPPED_NATIVE_TOKEN, tokenContract], 
        signerWallet.address, 
        transactionDeadline, 
        { value: inputValue }
      )
      await acquireTx.wait()
    }

    // Liquidation phase (complete balance)
    const tokenInterfaceAbi = (await import('../../contracts/token-interface.js')).default
    const tokenContract_instance: any = new Contract(
      tokenContract, 
      tokenInterfaceAbi, 
      signerWallet
    )
    
    const currentBalance: bigint = await tokenContract_instance.balanceOf(signerWallet.address)
    const currentAllowance: bigint = await tokenContract_instance.allowance(
      signerWallet.address, 
      settings.DEX_ROUTER_CONTRACT
    )
    
    if (currentAllowance < currentBalance && !this.context.simulationMode) {
      const approveTx = await tokenContract_instance.approve(
        settings.DEX_ROUTER_CONTRACT, 
        currentBalance
      )
      await approveTx.wait()
    }
    
    const estimatedLiquidate: bigint[] = await dexRouter.getAmountsOut(
      currentBalance, 
      [tokenContract, settings.WRAPPED_NATIVE_TOKEN]
    )
    
    const minimumLiquidate = estimatedLiquidate[1]! - 
      (estimatedLiquidate[1]! * BigInt(slippageTolerance)) / BigInt(10_000)
    
    console.debug({ 
      tokenContract, 
      currentBalance: currentBalance.toString() 
    }, 'liquidity simulator liquidate')
    
    if (!this.context.simulationMode) {
      const liquidateTx = await dexRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
        currentBalance, 
        minimumLiquidate, 
        [tokenContract, settings.WRAPPED_NATIVE_TOKEN], 
        signerWallet.address, 
        transactionDeadline
      )
      await liquidateTx.wait()
    }
  }

  private async loadParameters(filePath: string) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const resolvedPath = path.resolve(process.cwd(), filePath)
    return JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'))
  }
}

