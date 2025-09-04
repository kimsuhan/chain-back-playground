import { CompounderController } from '@/modules/compounder/compounder.controller';
import { CompounderResolver } from '@/modules/compounder/compounder.resolver';
import { ViemModule } from '@/modules/core/viem/viem.module';
import { Module } from '@nestjs/common';
import { CompounderService } from './compounder.service';

@Module({
  imports: [ViemModule],
  providers: [CompounderService, CompounderResolver],
  controllers: [CompounderController],
  exports: [CompounderService],
})
export class CompounderModule {}
