import { MULTI_SENDER_ABI, MULTI_SENDER_ADDRESS } from '@/modules/token-factory/consts/multi-sender.const';
import { ViemService } from '@/modules/viem/viem.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MultiSenderService {
  constructor(private readonly viemService: ViemService) {}

  /**
   * 이벤트 조회
   */
  async getEvent() {
    const contract = await this.viemService.publicClient.getContractEvents({
      address: MULTI_SENDER_ADDRESS,
      abi: MULTI_SENDER_ABI,
      eventName: 'SendMainTokens',
      toBlock: 'latest',
      fromBlock: 234282n,
    });

    console.log(contract);
  }
}
