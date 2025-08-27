import { PrismaModule } from '@/modules/prisma/prisma.module';
import { SimpleDexController } from '@/modules/simple-dex/simple-dex.controller';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { SimpleDexService } from './simple-dex.service';

@Module({
  imports: [ViemModule, PrismaModule],
  providers: [SimpleDexService],
  controllers: [SimpleDexController],
})
export class SimpleDexModule {}
