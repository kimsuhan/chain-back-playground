import { WalletUpsertInput } from '@/modules/wallet/dto/wallet-upsert.input';
import { WalletEntity } from '@/modules/wallet/entity/wallet.entity';
import { WalletService } from '@/modules/wallet/wallet.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver(() => WalletEntity)
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  @Query(() => [WalletEntity])
  wallets() {
    return this.walletService.findAllWallets();
  }

  @Mutation(() => WalletEntity)
  upsertWallet(@Args('data') data: WalletUpsertInput) {
    return this.walletService.upsertWallet(data.address, data.name);
  }
}
