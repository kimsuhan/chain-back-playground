import { PUB_SUB_PROVIDER } from '@/app.provider';
import { BlockResolver } from '@/modules/block/block.resolver';
import { RedisModule } from '@/modules/core/redis/redis.module';
import { ViemModule } from '@/modules/core/viem/viem.module';
import { Module } from '@nestjs/common';
import { BlockService } from './block.service';

@Module({
  imports: [ViemModule, RedisModule],
  providers: [BlockService, BlockResolver, PUB_SUB_PROVIDER],
  exports: [BlockService],
})
export class BlockModule {}
