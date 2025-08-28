import { BlockGateway } from '@/modules/block/block.gateway';
import { CACHE_KEY } from '@/modules/redis/consts/cache-key.const';
import { RedisService } from '@/modules/redis/redis.service';
import { ViemService } from '@/modules/viem/viem.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Block } from 'viem';

@Injectable()
export class BlockService implements OnModuleInit {
  private readonly logger = new Logger(BlockService.name);
  private readonly maxBlockCount: number = 1000;

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
      await this.blockPush(lastBlockNumber - this.maxBlockCount, lastBlockNumber);
    } else {
      await this.blockPush(redisBlockNumber, lastBlockNumber);
    }

    // 이벤트 리스너 등록
    this.setupEventListner();
  }

  /**
   * 블록 이벤트 처리
   */
  setupEventListner(): void {
    this.viemService.publicClient.watchBlockNumber({
      onBlockNumber: (blockNumber) => {
        void this.redisService.get(CACHE_KEY.LAST_BLOCK, 0).then(async (lastBlockNumber) => {
          await this.blockPush(Number(lastBlockNumber + 1), Number(blockNumber));
          // await this.redisService.set(CACHE_KEY.LAST_BLOCK, Number(blockNumber));
        });
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
    let percent = 0.0;

    this.logger.debug(`[ ${startBlockNumber} ~ ${endBlockNumber} ] 블록 정보 조회`);
    const blockNumbers = Array.from({ length: endBlockNumber - startBlockNumber + 1 }, (_, i) => startBlockNumber + i);
    const blocks = await this.viemService.getBlocks(blockNumbers);

    let i = 0;
    for (const block of blocks) {
      i++;

      const currentPercent = Math.round((i / blocks.length) * 100 * 100) / 100;
      if (currentPercent > percent) {
        percent = currentPercent;
        this.logger.verbose(`[ ${block.number} ] ${percent.toFixed(2)}%`);
      }

      pipeline.zadd(CACHE_KEY.BLOCK, Number(block.number), JSON.stringify(block));
      pipeline.zremrangebyrank(CACHE_KEY.BLOCK, 0, -this.maxBlockCount - 1); // 최대 개수 유지
    }

    this.blockGateway.broadcastNewBlock(blocks);
    await pipeline.exec();

    // 마지막 블록 정보 기록
    await this.redisService.set(CACHE_KEY.LAST_BLOCK, endBlockNumber);
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
    const redisBlock = await this.redisService.zrangebyscore(CACHE_KEY.BLOCK, blockNumber, blockNumber);
    if (redisBlock.length > 0) {
      this.logger.debug(`Redis에서 [ ${blockNumber} ] 블록 정보 조회 완료`);
      return JSON.parse(redisBlock[0]) as Block;
    }

    // Redis에 없으면 Chain에서 조회
    const block = await this.viemService.getBlock(blockNumber);
    if (!block || block === null) {
      return null;
    }

    this.logger.debug(`Chain에서 [ ${blockNumber} ] 블록 정보 조회 완료`);
    return block;
  }
}
