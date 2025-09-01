import { PrismaModule } from '@/modules/core/prisma/prisma.module';
import { ViemModule } from '@/modules/core/viem/viem.module';
import { TokenFactoryController } from '@/modules/token-factory/token-factory.controller';
import { Module } from '@nestjs/common';
import { TokenFactoryService } from './token-factory.service';

@Module({
  imports: [ViemModule, PrismaModule],
  providers: [TokenFactoryService],
  exports: [TokenFactoryService],
  controllers: [TokenFactoryController],
})
export class TokenFactoryModule {}
