import { PrismaModule } from '@/modules/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { WalletResolver } from './wallet.resolver';
import { WalletService } from './wallet.service';

@Module({
  imports: [PrismaModule],
  providers: [WalletService, WalletResolver],
  exports: [WalletService],
})
export class WalletModule {}
