import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlockService } from './block.service';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  async getBlocks(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.blockService.getBlocks(Number(limit), Number(offset));
  }

  @Get('/:blockNumber')
  async detailBlock(@Param('blockNumber') blockNumber: number) {
    return this.blockService.detailBlock(Number(blockNumber));
  }
}
