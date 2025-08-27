import chainConfig from '@/configs/chain.config';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Block, createPublicClient, createWalletClient, http, PublicClient, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class ViemService implements OnModuleInit {
  private readonly logger = new Logger(ViemService.name);
  publicClient: PublicClient;
  walletClient: WalletClient;

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

      // const ily = defineChain({
      //   id: 69923,
      //   name: 'iLity',
      //   nativeCurrency: {
      //     decimals: 18,
      //     name: 'Ether',
      //     symbol: 'ILY',
      //   },
      //   rpcUrls: {
      //     default: {
      //       http: [this.chainConfigs.rpcUrl],
      //       webSocket: ['wss://rpc.zora.energy'],
      //     },
      //   },
      //   blockExplorers: {
      //     default: { name: 'Explorer', url: 'https://explorer.zora.energy' },
      //   },
      //   contracts: {
      //     multicall3: {
      //       address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      //       blockCreated: 5882,
      //     },
      //   },
      // });

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
          contracts: {
            multicall3: {
              address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            },
          },
        },
        transport: http(this.chainConfigs.rpcUrl),
      });

      const account = privateKeyToAccount('0xfa5efb133cb1ff4f4b42c6a5878d75e3c86cb88c7a3a267ee58667e1f31741cd');
      this.walletClient = createWalletClient({
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
          contracts: {
            multicall3: {
              address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            },
          },
        },
        transport: http(this.chainConfigs.rpcUrl),
        account,
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
  async getBlockTransactionCount(blockNumber: bigint): Promise<number> {
    const count = await this.publicClient.getBlockTransactionCount({
      blockNumber: blockNumber,
    });

    return count;
  }

  /**
   * 트랜잭션 조회
   *
   * @param hash
   * @returns 트랜잭션 정보
   */
  async getTransaction(blockHash: string, index: number) {
    const transaction = await this.publicClient.getTransaction({
      blockHash: blockHash as `0x${string}`,
      index: index,
    });

    return transaction;
  }
}
