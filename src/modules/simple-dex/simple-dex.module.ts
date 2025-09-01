import { PrismaModule } from '@/modules/core/prisma/prisma.module';
import { ViemModule } from '@/modules/core/viem/viem.module';
import { SimpleDexController } from '@/modules/simple-dex/simple-dex.controller';
import { Module } from '@nestjs/common';
import { SimpleDexService } from './simple-dex.service';

@Module({
  imports: [ViemModule, PrismaModule],
  providers: [SimpleDexService],
  controllers: [SimpleDexController],
})
export class SimpleDexModule {}
