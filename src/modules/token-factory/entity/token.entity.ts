import { WalletEntity } from '@/modules/wallet/entity/wallet.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenEntity {
  @Field(() => Int, { description: 'Token id' })
  id!: number;

  @Field(() => String, { description: 'Token address' })
  address!: string;

  @Field(() => String, { description: 'Token name' })
  name!: string;

  @Field(() => String, { description: 'Token Symbol' })
  symbol!: string;

  @Field(() => Int, { description: 'Token decimals' })
  decimals!: number;

  @Field(() => String, { description: 'Token total supply' })
  totalSupply!: string;

  @Field(() => String, { description: 'Token tx hash' })
  txHash!: string;

  @Field(() => String, { description: 'Token owner' })
  owner!: string;

  @Field(() => WalletEntity, { description: 'Token owner', nullable: true })
  ownerAddon!: WalletEntity | null;

  @Field(() => String, { description: 'Token block number' })
  blockNumber!: string;

  @Field(() => Date, { description: 'Token created at' })
  createdAt!: Date;

  @Field(() => Date, { description: 'Token updated at' })
  updatedAt!: Date;
}
