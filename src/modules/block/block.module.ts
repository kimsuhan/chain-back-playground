import { BlockController } from '@/modules/block/block.controller';
import { BlockGateway } from '@/modules/block/block.gateway';
import { BlockSchedule } from '@/modules/block/block.schedule';
import { RedisModule } from '@/modules/redis/redis.module';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { BlockService } from './block.service';

@Module({
  imports: [ViemModule, RedisModule],
  controllers: [BlockController],
  providers: [BlockService, BlockGateway, BlockSchedule],
  exports: [BlockService],
})
export class BlockModule {}
