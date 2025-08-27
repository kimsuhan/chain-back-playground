import { SimpleDexService } from '@/modules/simple-dex/simple-dex.service';
import { Controller, Delete, Get, Param } from '@nestjs/common';

@Controller('simple-dex')
export class SimpleDexController {
  constructor(private readonly simpleDexService: SimpleDexService) {}

  @Delete('pools/flush')
  async flushPool() {
    return await this.simpleDexService.flushPool();
  }

  @Get('pools')
  async getPools() {
    return await this.simpleDexService.getPools();
  }

  @Get('pools/:poolId/history')
  async getPoolHistory(@Param('poolId') poolId: number) {
    return await this.simpleDexService.getPoolHistory(Number(poolId));
  }
}
