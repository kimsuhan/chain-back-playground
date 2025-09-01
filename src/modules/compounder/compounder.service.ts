import {
  COMPTROLLER_ABI,
  COMPTROLLER_ADDRESS,
  CTOKEN_ABI,
  CTOKEN_BYTE_CODE,
  JUMP_RATE_MODEL_ADDRESS,
  PRICE_ORACLE_ABI,
  PRICE_ORACLE_ADDRESS,
} from '@/configs/blocks/compounder.const';
import { ViemService } from '@/modules/core/viem/viem.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompounderService {
  constructor(private readonly viemService: ViemService) {}

  async setupMarketCToken(tokenAddress: string, name: string, symbol: string, reserveFactor: number, collateralFactor: number) {
    // 1. CToken Contract Deploy
    const ctokenContract = await this.viemService.walletClient.deployContract({
      abi: CTOKEN_ABI,
      account: this.viemService.account,
      bytecode: CTOKEN_BYTE_CODE,
      chain: this.viemService.chain,
      args: [
        tokenAddress as `0x${string}`, // 기초 자산이 될 Token Contract Address
        COMPTROLLER_ADDRESS, // Comptroller Contract Address
        JUMP_RATE_MODEL_ADDRESS, // Interest Rate Model Contract Address
        BigInt(reserveFactor * 1e18), // Reserve Factor
        name, // Name
        symbol, // Symbol
      ],
    });

    const receipt = await this.viemService.publicClient.waitForTransactionReceipt({
      hash: ctokenContract,
    });

    // 2. CToken 을 시장에 등록
    const supportMarketTxHash = await this.viemService.walletClient.writeContract({
      chain: this.viemService.chain,
      account: this.viemService.account,
      address: COMPTROLLER_ADDRESS,
      abi: COMPTROLLER_ABI,
      functionName: '_supportMarket',
      args: [receipt.contractAddress as `0x${string}`],
    });

    await this.viemService.publicClient.waitForTransactionReceipt({
      hash: supportMarketTxHash,
    });

    console.log('success register ctoken contract');
    // 3. 담보 비율 설정
    const setCollateralFactorTxHash = await this.viemService.walletClient.writeContract({
      chain: this.viemService.chain,
      account: this.viemService.account,
      address: COMPTROLLER_ADDRESS,
      abi: COMPTROLLER_ABI,
      functionName: '_setCollateralFactor',
      args: [receipt.contractAddress as `0x${string}`, BigInt(collateralFactor * 1e18)],
    });
    await this.viemService.publicClient.waitForTransactionReceipt({
      hash: setCollateralFactorTxHash,
    });
    console.log('success set collateral factor');

    // // ============================================
    // // Oracle 설정
    // // ============================================
    const setUnderlyingPriceTxHash = await this.viemService.walletClient.writeContract({
      chain: this.viemService.chain,
      account: this.viemService.account,
      address: PRICE_ORACLE_ADDRESS,
      abi: PRICE_ORACLE_ABI,
      functionName: 'setUnderlyingPrice',
      args: [receipt.contractAddress as `0x${string}`, BigInt(1 * 1e18)], // DAI = 1$ (TODO)
    });
    await this.viemService.publicClient.waitForTransactionReceipt({
      hash: setUnderlyingPriceTxHash,
    });
    console.log('success set underlying price');

    // ============================================
    // 초기 유동성 제공
    // ============================================
    const mintTxHash = await this.viemService.walletClient.writeContract({
      chain: this.viemService.chain,
      account: this.viemService.account,
      address: receipt.contractAddress as `0x${string}`,
      abi: CTOKEN_ABI,
      functionName: 'mint',
      args: [BigInt(10000 * 1e18)],
    });
    await this.viemService.publicClient.waitForTransactionReceipt({
      hash: mintTxHash,
    });
    console.log('success mint ctoken');
  }
}
