import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WalletEntity {
  @Field(() => Int, { description: 'Wallet id' })
  id!: number;

  @Field(() => String, { description: 'Wallet address' })
  address!: string;

  @Field(() => String, { description: 'Wallet name' })
  name!: string;

  @Field(() => Date, { description: 'Wallet created at' })
  createdAt!: Date;

  @Field(() => Date, { description: 'Wallet updated at' })
  updatedAt!: Date;
}
