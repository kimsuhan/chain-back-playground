import { Controller, Get } from '@nestjs/common';
import { MultiSenderService } from './multi-sender.service';

@Controller('multi-sender')
export class MultiSenderController {
  constructor(private readonly multiSenderService: MultiSenderService) {}

  @Get('/events')
  async getEvents() {
    return await this.multiSenderService.getEvent();
  }
}
