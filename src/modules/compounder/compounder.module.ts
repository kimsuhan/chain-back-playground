import { CompounderController } from '@/modules/compounder/compounder.controller';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { CompounderService } from './compounder.service';

@Module({
  imports: [ViemModule],
  providers: [CompounderService],
  controllers: [CompounderController],
  exports: [CompounderService],
})
export class CompounderModule {}
