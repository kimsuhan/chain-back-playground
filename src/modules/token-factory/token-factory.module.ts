import { PrismaModule } from '@/modules/core/prisma/prisma.module';
import { ViemModule } from '@/modules/core/viem/viem.module';
import { TokenFactoryResolver } from '@/modules/token-factory/token-factory.resolver';
import { Module } from '@nestjs/common';
import { TokenFactoryService } from './token-factory.service';

@Module({
  imports: [ViemModule, PrismaModule],
  providers: [TokenFactoryService, TokenFactoryResolver],
  exports: [TokenFactoryService],
})
export class TokenFactoryModule {}
