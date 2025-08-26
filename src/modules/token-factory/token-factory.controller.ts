import { Controller, Get, Post, Query } from '@nestjs/common';
import { TokenFactoryService } from './token-factory.service';

@Controller('token-factory')
export class TokenFactoryController {
  constructor(private readonly tokenFactoryService: TokenFactoryService) {}

  @Get('tokens')
  async getTokens(@Query('limit') limit: number, @Query('offset') offset: number) {
    return await this.tokenFactoryService.getTokens(Number(limit), Number(offset));
  }

  @Post('reset')
  async reset() {
    return await this.tokenFactoryService.reset();
  }
}
