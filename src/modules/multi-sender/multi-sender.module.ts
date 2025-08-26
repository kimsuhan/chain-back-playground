import { MultiSenderController } from '@/modules/multi-sender/multi-sender.controller';
import { MultiSenderService } from '@/modules/multi-sender/multi-sender.service';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ViemModule],
  controllers: [MultiSenderController],
  providers: [MultiSenderService],
  exports: [MultiSenderService],
})
export class MultiSenderModule {}
