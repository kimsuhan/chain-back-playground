import chainConfig from '@/configs/chain.config';
import walletConfig from '@/configs/wallet.config';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Block, Chain, createPublicClient, createWalletClient, defineChain, http, PublicClient, WalletClient } from 'viem';
import { Account, privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class ViemService implements OnModuleInit {
  private readonly logger = new Logger(ViemService.name);
  account!: Account;
  publicClient!: PublicClient;
  walletClient!: WalletClient;
  chain!: Chain;

  constructor(
    @Inject(chainConfig.KEY)
    private chainConfigs: ConfigType<typeof chainConfig>,

    @Inject(walletConfig.KEY)
    private walletConfigs: ConfigType<typeof walletConfig>,
  ) {}

  /**
   * 모듈 초기화
   */
  onModuleInit() {
    try {
      this.logger.log('┌─────────────────────────────┐');
      this.logger.log('  Viem 세팅 시작');
      this.logger.log(`  RPC_URL: ${this.chainConfigs.rpcUrl}`);

      this.chain = defineChain({
        id: 69923,
        name: 'iLity',
        nativeCurrency: {
          decimals: 18,
          name: 'Ether',
          symbol: 'ILY',
        },
        rpcUrls: {
          default: {
            http: [this.chainConfigs.rpcUrl as string],
            // webSocket: ['wss://ㅑ.zora.energy'],
          },
        },
        blockExplorers: {
          default: { name: 'Explorer', url: 'https://ily-explorer.blockgateway.net/' },
        },
        contracts: {
          multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            blockCreated: 5882,
          },
        },
      });

      this.publicClient = createPublicClient({
        chain: this.chain,
        transport: http(this.chainConfigs.rpcUrl),
      });

      this.account = privateKeyToAccount(this.walletConfigs.privateKey as `0x${string}`);
      this.walletClient = createWalletClient({
        chain: this.chain,
        transport: http(this.chainConfigs.rpcUrl),
        account: this.account,
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
    try {
      const block = await this.publicClient.getBlock({
        blockNumber: BigInt(blockNumber),
        includeTransactions: true,
      });

      return block;
    } catch {
      return null;
    }
  }

  /**
   * 블록 정보 조회
   *
   * @param blockNumbers
   * @returns
   */
  async getBlocks(blockNumbers: number[]): Promise<Block[]> {
    const blocks = await Promise.all(
      blockNumbers.map(async (blockNumber) => {
        const block = await this.publicClient.getBlock({
          blockNumber: BigInt(blockNumber),
          includeTransactions: true,
        });
        return block;
      }),
    );

    return blocks;
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
