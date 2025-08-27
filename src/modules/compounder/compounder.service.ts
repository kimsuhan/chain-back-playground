import { ViemService } from '@/modules/viem/viem.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompounderService {
  constructor(private readonly viemService: ViemService) {}
  // CToken ABI (필요한 부분만)
  cTokenABI = [
    {
      type: 'constructor',
      inputs: [
        { name: 'underlying_', type: 'address' },
        { name: 'comptroller_', type: 'address' },
        { name: 'interestRateModel_', type: 'address' },
        { name: 'reserveFactorMantissa_', type: 'uint256' },
        { name: 'name_', type: 'string' },
        { name: 'symbol_', type: 'string' },
      ],
    },
    // ... 다른 필요한 함수들
  ];

  async deployCToken() {
    // const coreAddresses = {
    //   comptroller: '0x05C613C70367e28b63EC5F89EB848Be7585d7187',
    //   jumpRateModel: '0xf3De46560196a4B507A13bE901bdF914d203895f',
    //   oracle: '0x7127928923aB4958eF16a5125411a5a4039C5D5E',
    // };
    // 3-2. 가스 추정
    // await this.viemService.walletClient.writeContract({
    //   abi: this.cTokenABI,
    // });
    // const gasEstimate = await this.viemService.publicClient.estimateContractGas({
    //   abi: this.cTokenABI,
    //   // code: cTokenByteCode,
    //   // account: this.viemService.account.address,
    //   args: [
    //     underlyingAddress, // underlying
    //     coreAddresses.comptroller, // comptroller
    //     coreAddresses.jumpRateModel, // interest rate model
    //     BigInt(Math.floor(reserveFactor * 1e18)), // reserve factor
    //     `Compound ${tokenName}`, // name
    //     `c${tokenSymbol}`, // symbol
    //   ],
    // });
  }
}
