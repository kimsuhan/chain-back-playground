import { BlockGateway } from '@/modules/block/block.gateway';
import { CACHE_KEY } from '@/modules/redis/consts/cache-key.const';
import { RedisService } from '@/modules/redis/redis.service';
import { ViemService } from '@/modules/viem/viem.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Block } from 'viem';

@Injectable()
export class BlockService implements OnModuleInit {
  private readonly logger = new Logger(BlockService.name);

  constructor(
    private readonly viemService: ViemService,
    private readonly redisService: RedisService,
    private readonly blockGateway: BlockGateway,
  ) {}

  /**
   * 모듈 초기화 시 마지막 블록 번호 조회 및 블록 정보 저장
   */
  async onModuleInit() {
    const lastBlockNumber = await this.viemService.getLastBlockNumber(); // 현재 블록 번호
    const redisBlockNumber = await this.redisService.get(CACHE_KEY.LAST_BLOCK, 0); // 마지막 블록 번호
    if (redisBlockNumber === lastBlockNumber) {
      return;
    }

    // 마지막 블록 넘버 - 레디스에 기록된 블록 넘버의 차이가 10,000개 이상이면 마지막 기록부터 10,000개만 저장
    if (lastBlockNumber - redisBlockNumber > 1000) {
      await this.blockPush(lastBlockNumber - 1000, lastBlockNumber);
    } else {
      await this.blockPush(redisBlockNumber, lastBlockNumber);
    }

    // 마지막 블록 정보 기록
    await this.redisService.set(CACHE_KEY.LAST_BLOCK, lastBlockNumber);

    this.eventBlock();
  }

  eventBlock() {
    this.viemService.publicClient.watchBlockNumber({
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onBlockNumber: async (blockNumber) => {
        const lastBlockNumber = await this.redisService.get(CACHE_KEY.LAST_BLOCK, 0);
        await this.blockPush(Number(lastBlockNumber), Number(blockNumber));
        await this.redisService.set(CACHE_KEY.LAST_BLOCK, Number(blockNumber));
      },
    });
  }

  /**
   * Redis 에 블록 정보 저장
   *
   * @param blockNumber
   */
  async blockPush(startBlockNumber: number, endBlockNumber: number): Promise<void> {
    const pipeline = this.redisService.getPipeline();
    const blocks: Block[] = [];
    let percent = 0.0;
    for (let i = startBlockNumber; i < endBlockNumber; i++) {
      const block: Block | null = await this.viemService.getBlock(i);
      if (!block || block === null) {
        this.logger.error('❌ 블록 정보 조회 실패');
        continue;
      }

      const currentPercent = Math.round((i / endBlockNumber) * 100 * 100) / 100;
      if (currentPercent > percent) {
        percent = currentPercent;
        this.logger.verbose(`[ ${block.number} ] ${percent.toFixed(2)}%`);
      }

      const transactionCount = await this.viemService.getBlockTransactionCount(block.number!);
      if (transactionCount > 0) {
        for (let i = 0; i < transactionCount; i++) {
          const transaction = await this.viemService.publicClient.getTransaction({
            blockHash: block.hash as `0x${string}`,
            index: i,
          });

          console.log(transaction);
        }
      }

      pipeline.zadd(CACHE_KEY.BLOCK, Number(block.number), JSON.stringify(block));
      blocks.push(block);

      pipeline.zremrangebyrank(CACHE_KEY.BLOCK, 0, -10001); // 10,000개 유지
    }

    this.blockGateway.broadcastNewBlock(blocks);
    this.logger.debug(`${startBlockNumber} ~ ${endBlockNumber} 새로운 블록 저장`);
    await pipeline.exec();
  }

  /**
   * 블록 정보 조회
   *
   * @param limit
   * @param offset
   */
  async getBlocks(limit: number, offset: number): Promise<{ data: Block[]; total: number }> {
    const start = offset;
    const end = offset + limit - 1;
    const total = await this.redisService.zcard(CACHE_KEY.BLOCK);
    const blocks = await this.redisService.zrevrange(CACHE_KEY.BLOCK, start, end);

    const response = blocks.map((block) => JSON.parse(block) as Block);

    return {
      data: response,
      total,
    };
  }

  /**
   * 블록 상세 조회
   *
   * @param blockNumber
   * @returns 블록 상세 정보
   */
  async detailBlock(blockNumber: number): Promise<Block | null> {
    const block = await this.viemService.getBlock(blockNumber);
    if (!block || block === null) {
      return null;
    }

    return block;
  }
}
