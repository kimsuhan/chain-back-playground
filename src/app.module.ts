import { LoggerMiddleware } from '@/commons/logger.middleware';
import { BlockModule } from '@/modules/block/block.module';
import { CompounderModule } from '@/modules/compounder/compounder.module';
import { MultiSenderModule } from '@/modules/multi-sender/multi-sender.module';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { RedisModule } from '@/modules/redis/redis.module';
import { SimpleDexModule } from '@/modules/simple-dex/simple-dex.module';
import { TokenFactoryModule } from '@/modules/token-factory/token-factory.module';
import { ViemModule } from '@/modules/viem/viem.module';
import { WalletModule } from '@/modules/wallet/wallet.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import chainConfig from 'src/configs/chain.config';
import redisConfig from 'src/configs/redis.config';
import { PUB_SUB_PROVIDER } from './app.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [chainConfig, redisConfig],
    }),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/configs/schema.gql',
      subscriptions: {
        'graphql-ws': true,
      },
    }),

    RedisModule,
    PrismaModule,
    ViemModule,

    BlockModule,
    WalletModule,
    TokenFactoryModule,
    MultiSenderModule,
    SimpleDexModule,
    CompounderModule,
  ],
  providers: [PUB_SUB_PROVIDER],
  exports: ['PUB_SUB'],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
