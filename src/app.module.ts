import { BlockModule } from '@/modules/block/block.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { RedisModule } from '@/modules/redis/redis.module';
import { TokenFactoryModule } from '@/modules/token-factory/token-factory.module';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import chainConfig from 'src/configs/chain.config';
import redisConfig from 'src/configs/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [chainConfig, redisConfig],
    }),
    ScheduleModule.forRoot(),

    RedisModule,
    PrismaModule,
    ViemModule,

    BlockModule,
    TokenFactoryModule,
  ],
})
export class AppModule {}
