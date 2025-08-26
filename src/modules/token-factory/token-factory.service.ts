import { PrismaService } from '@/modules/prisma/prisma.service';
import { ERC20_ABI } from '@/modules/token-factory/consts/erc20.const';
import { TOKEN_FACTORY_ABI, TOKEN_FACTORY_ADDRESS } from '@/modules/token-factory/consts/token-factory.const';
import { ViemService } from '@/modules/viem/viem.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { parseAbiItem } from 'viem';

@Injectable()
export class TokenFactoryService implements OnModuleInit {
  private readonly logger = new Logger(TokenFactoryService.name);

  async onModuleInit(): Promise<void> {
    void this.setupEventListeners();
    await this.saveAllToken();
    // await this.init();
  }

  constructor(
    private readonly viemService: ViemService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 실시간 이벤트 리스너 설정
   */
  setupEventListeners() {
    this.logger.debug('🎧 실시간 이벤트 리스너 설정...');

    this.viemService.publicClient.watchEvent({
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      onLogs: () => {
        void this.saveAllToken();
      },
    });
  }

  /**
   * 토큰 조회
   */
  async saveAllToken() {
    const lastBlockNumber = await this.prisma.token.aggregate({
      _max: {
        blockNumber: true,
      },
    });

    const logs = await this.viemService.publicClient.getLogs({
      event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
      fromBlock: lastBlockNumber._max.blockNumber ?? 0n,
      toBlock: 'latest',
    });

    if (logs && logs.length > 0) {
      const findToken: { name: string; symbol: string; address: string }[] = [];
      for (const log of logs) {
        // 민팅 이벤트가 아니면 스킵
        if (log.args.from !== '0x0000000000000000000000000000000000000000') {
          continue;
        }

        // 이미 저장된 토큰이면 스킵
        const findToken = await this.prisma.token.count({ where: { address: log.address } });
        if (findToken > 0) continue;

        const name = await this.viemService.publicClient.readContract({
          address: log.address,
          abi: ERC20_ABI,
          functionName: 'name',
        });

        const symbol = await this.viemService.publicClient.readContract({
          address: log.address,
          abi: ERC20_ABI,
          functionName: 'symbol',
        });

        const totalSupply = await this.viemService.publicClient.readContract({
          address: log.address,
          abi: ERC20_ABI,
          functionName: 'totalSupply',
        });

        await this.prisma.token.create({
          data: {
            address: log.address,
            name: name as string,
            symbol: symbol as string,
            decimals: 18,
            totalSupply: String(totalSupply),
            txHash: log.transactionHash,
            owner: log.args.to as `0x${string}`,
            blockNumber: log.blockNumber,
          },
        });
      }

      console.log(findToken);
    }
  }

  /**
   * 토큰 정보 삽입
   *
   * @param name 토큰 이름
   * @param symbol 토큰 심볼
   * @param initialSupply 토큰 초기 공급량
   * @param owner 토큰 소유자
   * @param event 이벤트 정보
   */
  async insertToken(param: { name: string; symbol: string; initialSupply: string; tokenAddress: `0x${string}`; txHash: string; owner: string; blockNumber: bigint }) {
    await this.prisma.token.upsert({
      where: { address: param.tokenAddress },
      update: { name: param.name, symbol: param.symbol },
      create: {
        address: param.tokenAddress,
        name: param.name,
        symbol: param.symbol,
        decimals: 18,
        totalSupply: param.initialSupply,
        txHash: param.txHash,
        owner: param.owner,
        blockNumber: param.blockNumber,
      },
    });
  }

  /**
   * 토큰 목록 조회
   *
   * @returns 토큰 목록
   */
  async getTokens(limit: number, offset: number) {
    const total = await this.prisma.token.count();
    const data = await this.prisma.token.findMany({
      skip: offset,
      take: limit,
      orderBy: { blockNumber: 'desc' },
    });

    return {
      data,
      total,
    };
  }

  /**
   * 토큰 목록 초기화
   *
   * @deprecated
   */
  async init() {
    // 이벤트를 찾은 마지막 블록부터 조회 합니다.
    const lastBlockNumber = await this.prisma.token.aggregate({
      _max: {
        blockNumber: true,
      },
    });

    const searchBlockNumber = lastBlockNumber._max.blockNumber ?? 0n;
    const events = await this.viemService.publicClient.getContractEvents({
      address: TOKEN_FACTORY_ADDRESS,
      abi: TOKEN_FACTORY_ABI,
      eventName: 'TokenDeployed',
      toBlock: 'latest',
      fromBlock: searchBlockNumber + 1n,
    });

    for (const event of events) {
      const args = event['args'] as { name: string; symbol: string; initialSupply: bigint; owner: string };

      const data = await this.viemService.publicClient.readContract({
        address: TOKEN_FACTORY_ADDRESS,
        abi: TOKEN_FACTORY_ABI,
        functionName: 'tokenAddresses',
        args: [args.symbol],
      });

      const findToken = await this.prisma.token.count({ where: { address: data as `0x${string}` } });

      if (findToken === 0) {
        this.logger.log(`🔍 새로운 토큰 발견: ${args.name} ${args.symbol} ${args.initialSupply} ${args.owner}`);
        await this.insertToken({
          name: args.name,
          symbol: args.symbol,
          initialSupply: String(args.initialSupply),
          tokenAddress: data as `0x${string}`,
          txHash: event.transactionHash,
          owner: args.owner,
          blockNumber: event.blockNumber,
        });
      }
    }
  }

  async reset() {
    await this.prisma.token.deleteMany();
    // void this.init();
  }
}
