import { DEX_ABI, DEX_CONTRACT_ADDRESS } from '@/configs/blocks/simple-dex.const';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { ERC20_ABI } from '@/modules/token-factory/consts/erc20.const';
import { ViemService } from '@/modules/viem/viem.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SimpleDexService implements OnModuleInit {
  constructor(
    private readonly viemService: ViemService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * 모듈 초기화 시 풀 정보 초기화
   */
  async onModuleInit() {
    await this.initPool();
    this.eventListener();
  }

  eventListener() {
    this.viemService.publicClient.watchContractEvent({
      abi: DEX_ABI,
      address: DEX_CONTRACT_ADDRESS,
      onLogs: (logs) => {
        console.log(logs);
        void this.initPool();
      },
    });
  }

  /**
   * 풀 정보 초기화
   */
  async initPool() {
    const events = await this.viemService.publicClient.getContractEvents({
      address: DEX_CONTRACT_ADDRESS,
      abi: DEX_ABI,
      eventName: 'LiquidityAdded',
      fromBlock: 1n, // TODO Contract가 배포된 시점으로부터 시작 하는것이 맞음 && 기록된 블록 번호로 조회 해야 함
      toBlock: 'latest',
    });

    // 1. 현재까지 쌓인 이벤트를 기반으로 어떤 토큰 쌍이 있는지 찾음
    for (const event of events) {
      const find = await this.prismaService.dexPool.findFirst({
        where: {
          tokenA: event.args.tokenA!,
          tokenB: event.args.tokenB!,
        },
      });

      // 풀이 없다면 선 생성
      let poolId: number;
      if (!find) {
        const [tokenASymbol, tokenBSymbol, tokenAName, tokenBName] = await Promise.all([
          this.viemService.publicClient.readContract({
            address: event.args.tokenA!,
            abi: ERC20_ABI,
            functionName: 'symbol',
          }),
          this.viemService.publicClient.readContract({
            address: event.args.tokenB!,
            abi: ERC20_ABI,
            functionName: 'symbol',
          }),
          this.viemService.publicClient.readContract({
            address: event.args.tokenA!,
            abi: ERC20_ABI,
            functionName: 'name',
          }),
          this.viemService.publicClient.readContract({
            address: event.args.tokenB!,
            abi: ERC20_ABI,
            functionName: 'name',
          }),
        ]);

        // 풀 생성 (초기화)
        const pool = await this.prismaService.dexPool.create({
          data: {
            tokenA: event.args.tokenA!,
            tokenASymbol: tokenASymbol as string,
            tokenAName: tokenAName as string,
            tokenB: event.args.tokenB!,
            tokenBSymbol: tokenBSymbol as string,
            tokenBName: tokenBName as string,
            amountA: '0',
            amountB: '0',
            totalLiquidity: '0',
          },
        });

        poolId = pool.id;
      } else {
        poolId = find.id;
      }

      const txFind = await this.prismaService.dexPoolHistory.findFirst({
        where: {
          txHash: event.transactionHash,
        },
      });

      if (!txFind) {
        const block = await this.viemService.publicClient.getBlock({
          blockNumber: event.blockNumber,
        });

        await this.prismaService.dexPoolHistory.create({
          data: {
            txHash: event.transactionHash,
            poolId,
            amountA: String(event.args.amountA!),
            amountB: String(event.args.amountB!),
            liquidity: String(event.args.liquidity!),
            timestamp: block.timestamp,
          },
        });
      }
    }

    // 2. 스왑 이벤트 조회
    const swapEvents = await this.viemService.publicClient.getContractEvents({
      address: DEX_CONTRACT_ADDRESS,
      abi: DEX_ABI,
      eventName: 'Swap',
      fromBlock: 1n, // TODO Contract가 배포된 시점으로부터 시작 하는것이 맞음 && 기록된 블록 번호로 조회 해야 함
      toBlock: 'latest',
    });

    for (const event of swapEvents) {
      const tokenA = event.args.tokenIn;
      const tokenB = event.args.tokenOut;
      const find = await this.prismaService.dexPool.findFirst({
        where: {
          OR: [
            { tokenA: tokenA, tokenB: tokenB },
            { tokenA: tokenB, tokenB: tokenA },
          ],
        },
      });

      if (!find) continue;

      const block = await this.viemService.publicClient.getBlock({
        blockNumber: event.blockNumber,
      });

      const txFind = await this.prismaService.dexPoolHistory.findFirst({
        where: {
          txHash: event.transactionHash,
        },
      });

      if (!txFind) {
        const amountA = tokenA === find.tokenA ? String(event.args.amountIn!) : String(event.args.amountOut!);
        const amountB = tokenA === find.tokenA ? String(event.args.amountOut!) : String(event.args.amountIn!);

        await this.prismaService.dexPoolHistory.create({
          data: {
            txHash: event.transactionHash,
            poolId: find.id,
            amountA,
            amountB,
            liquidity: '0',
            timestamp: block.timestamp,
          },
        });
      }
    }

    // 3. 찾은 토큰쌍을 기반으로 현재 풀 정보 조회
    const pools = await this.prismaService.dexPool.findMany();
    for (const pool of pools) {
      const poolInfo = await this.viemService.publicClient.readContract({
        address: DEX_CONTRACT_ADDRESS,
        abi: DEX_ABI,
        functionName: 'pools',
        args: [pool.tokenA as `0x${string}`, pool.tokenB as `0x${string}`],
      });

      await this.prismaService.dexPool.update({
        where: {
          id: pool.id,
        },
        data: {
          amountA: String(poolInfo[0]),
          amountB: String(poolInfo[1]),
          totalLiquidity: String(poolInfo[2]),
        },
      });
    }
  }

  /**
   * 풀 정보 조회
   */
  async getPools() {
    return await this.prismaService.dexPool.findMany();
  }

  /**
   * 풀 이력 조회
   */
  async getPoolHistory(poolId: number) {
    return await this.prismaService.dexPoolHistory.findMany({
      where: {
        poolId,
      },
    });
  }

  /**
   * 풀 정보 초기화
   */
  async flushPool() {
    await this.prismaService.dexPoolHistory.deleteMany();
    await this.prismaService.dexPool.deleteMany();
  }
}
