import { BlockController } from '@/modules/block/block.controller';
import { RedisModule } from '@/modules/redis/redis.module';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { BlockService } from './block.service';

@Module({
  imports: [ViemModule, RedisModule],
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
