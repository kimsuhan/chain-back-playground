import redisConfig from '@/configs/redis.config';
import { CACHE_KEY } from '@/modules/core/redis/consts/cache-key.const';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import Redis, { ChainableCommander } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private redis!: Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private redisConfigs: ConfigType<typeof redisConfig>,
  ) {}

  /**
   * 모듈 초기화
   */
  async onModuleInit() {
    const { host, port } = this.redisConfigs;

    try {
      this.logger.log('┌─────────────────────────────┐');
      this.logger.log('  Redis 세팅 시작');
      this.logger.log(`  REDIS_HOST: ${host}`);
      this.logger.log(`  REDIS_PORT: ${port}`);

      this.redis = new Redis({
        host,
        port,
      });

      await new Promise((resolve) => {
        this.redis.on('ready', () => {
          resolve(true);
          this.logger.log('  Redis 준비 완료');
        });

        this.redis.on('error', (error) => {
          this.logger.error('Redis Error', error);
        });
      });

      this.logger.log('└─────────────────────────────┘');
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Redis 연결 상태 확인
   *
   * @returns Redis 연결 상태
   */
  isReady(): boolean {
    return this.redis.status === 'ready';
  }

  /**
   * Redis의 기본 형인 String 타입 조회
   *
   * @param key
   * @returns 조회 결과
   */
  async get<T>(key: CACHE_KEY, defaultValue: T): Promise<T> {
    const value = await this.redis.get(key);
    if (value === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(error);
      return defaultValue;
    }
  }

  /**
   * Redis 기본 형인 String 타입 저장
   *
   * @param key
   * @param value
   */
  async set(key: CACHE_KEY, value: any): Promise<void> {
    await this.redis.set(key, String(value));
  }

  async lpush(key: CACHE_KEY, value: string): Promise<void> {
    await this.redis.lpush(key, value);
  }

  async lrange(key: CACHE_KEY, start: number, end: number): Promise<string[]> {
    return await this.redis.lrange(key, start, end);
  }

  async flushall(): Promise<void> {
    await this.redis.flushall();
  }

  async zcard(key: CACHE_KEY): Promise<number> {
    return await this.redis.zcard(key);
  }

  async zrevrange(key: CACHE_KEY, start: number, end: number): Promise<string[]> {
    return await this.redis.zrevrange(key, start, end);
  }

  /**
   * member를 지정해서 score를 조회
   *
   * @param key
   * @param member
   * @returns
   */
  async zscore(key: CACHE_KEY, member: string): Promise<string | null> {
    return await this.redis.zscore(key, member);
  }

  /**
   * 지정한 score 범위에 해당하는 멤버 조회
   *
   * @param key
   * @param min
   * @param max
   * @returns
   */
  async zrangebyscore(key: CACHE_KEY, min: number, max: number): Promise<string[]> {
    return await this.redis.zrangebyscore(key, min, max);
  }

  /**
   * Redis Pipeline 생성
   *
   * @returns Pipeline
   */
  getPipeline(): ChainableCommander {
    return this.redis.pipeline();
  }
}
