import { PrismaService } from '@/modules/core/prisma/prisma.service';
import { RedisService } from '@/modules/core/redis/redis.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

BigInt.prototype.toJSON = function () {
  return String(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);

  // redis 연결 테스트
  const redisReady = app.get(RedisService).isReady();
  if (!redisReady) {
    console.error('Redis 연결 실패');
    process.exit(1);
  }

  const prismaReady = await app.get(PrismaService).isReady();
  if (!prismaReady) {
    console.error('Prisma 연결 실패');
    process.exit(1);
  }

  const logger = new Logger('Main');
  logger.log(`🚀 API Server running on http://localhost:${port}`);
}

void bootstrap();
