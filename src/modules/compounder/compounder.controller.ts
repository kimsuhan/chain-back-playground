import { CompounderService } from '@/modules/compounder/compounder.service';
import { Controller, Get } from '@nestjs/common';

@Controller('compounder')
export class CompounderController {
  constructor(private readonly compounderService: CompounderService) {}

  @Get('/deploy')
  async deploy() {
    return this.compounderService.setupMarketCToken(
      '0xe45df439f90e840a3c5b66147ebc0df191bfe35c', // FLOCK
      'FLOCK',
      'cFLOCK',
      0.1, // 10%
      0.75, // 75%
    );
  }
}
