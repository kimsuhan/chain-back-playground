import { CompounderService } from '@/modules/compounder/compounder.service';
import { Args, Mutation } from '@nestjs/graphql';

// @Resolver(() => WalletEntity)
export class CompounderResolver {
  constructor(private readonly compounderService: CompounderService) {}

  @Mutation(() => String)
  async setupMarketCToken(
    @Args('tokenAddress') tokenAddress: string,
    @Args('name') name: string,
    @Args('symbol') symbol: string,
    @Args('reserveFactor') reserveFactor: number,
    @Args('collateralFactor') collateralFactor: number,
  ) {
    return this.compounderService.setupMarketCToken(tokenAddress, name, symbol, reserveFactor, collateralFactor);
  }
}
