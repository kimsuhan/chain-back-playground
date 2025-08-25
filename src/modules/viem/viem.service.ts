import chainConfig from '@/configs/chain.config';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Block, createPublicClient, http, PublicClient } from 'viem';

@Injectable()
export class ViemService implements OnModuleInit {
  private readonly logger = new Logger(ViemService.name);
  publicClient: PublicClient;

  constructor(
    @Inject(chainConfig.KEY)
    private chainConfigs: ConfigType<typeof chainConfig>,
  ) {}

  /**
   * 모듈 초기화
   */
  onModuleInit() {
    try {
      this.logger.log('┌─────────────────────────────┐');
      this.logger.log('  Viem 세팅 시작');
      this.logger.log(`  RPC_URL: ${this.chainConfigs.rpcUrl}`);

      this.publicClient = createPublicClient({
        chain: {
          id: Number(this.chainConfigs.chainId),
          name: 'Ethereum',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          blockTime: 10_000,
          rpcUrls: {
            default: {
              http: [this.chainConfigs.rpcUrl as string],
            },
          },
          testnet: true,
        },
        transport: http(this.chainConfigs.rpcUrl),
      });

      this.logger.log('└─────────────────────────────┘');
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * 마지막 블록 번호 조회
   *
   * @returns 마지막 블록 번호
   */
  async getLastBlockNumber(): Promise<number> {
    const blockNumber = await this.publicClient.getBlockNumber();
    return Number(blockNumber);
  }

  /**
   * 블록 정보 조회
   *
   * @param blockNumber
   * @returns
   */
  async getBlock(blockNumber: number): Promise<Block | null> {
    const block: Block = await this.publicClient.getBlock({
      blockNumber: BigInt(blockNumber),
    });

    return block;
  }

  /**
   * 블록 트랜잭션 개수 조회
   *
   * @param blockNumber
   * @returns 블록 트랜잭션 개수
   */
  async getBlockTransactionCount(blockNumber: number): Promise<number> {
    const count = await this.publicClient.getBlockTransactionCount({
      blockNumber: BigInt(blockNumber),
    });

    return count;
  }
}
