import { PrismaService } from '@/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 모든 지갑 조회
   *
   * @returns 모든 지갑 정보
   */
  async findAllWallets() {
    return this.prisma.wallet.findMany();
  }

  /**
   * 지갑 생성 또는 업데이트
   *
   * @param address
   * @param name
   */
  async upsertWallet(address: string, name: string) {
    const wallet = await this.prisma.wallet.upsert({
      where: { address },
      update: { name },
      create: { address, name },
    });

    return wallet;
  }
}
