import { BlockService } from '@/modules/block/block.service';
import { CACHE_KEY } from '@/modules/redis/consts/cache-key.const';
import { RedisService } from '@/modules/redis/redis.service';
import { ViemService } from '@/modules/viem/viem.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BlockSchedule {
  constructor(
    private readonly blockService: BlockService,
    private readonly viemService: ViemService,
    private readonly redisService: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handle() {
    let isCall = true;
    if (!isCall) {
      return;
    }

    const lastBlockNumber = await this.viemService.getLastBlockNumber(); // 현재 블록 번호
    const redisBlockNumber = await this.redisService.get(CACHE_KEY.LAST_BLOCK, 0); // 마지막 블록 번호
    if (redisBlockNumber === lastBlockNumber) {
      return;
    }

    // 마지막 블록 넘버 - 레디스에 기록된 블록 넘버의 차이가 10,000개 이상이면 마지막 기록부터 10,000개만 저장
    if (lastBlockNumber - redisBlockNumber > 10000) {
      await this.blockService.blockPush(lastBlockNumber - 10000, lastBlockNumber);
    } else {
      await this.blockService.blockPush(redisBlockNumber, lastBlockNumber);
    }

    // 마지막 블록 정보 기록
    await this.redisService.set(CACHE_KEY.LAST_BLOCK, lastBlockNumber);

    isCall = false;
  }
}
