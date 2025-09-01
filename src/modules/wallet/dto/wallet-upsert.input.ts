import { Field, InputType } from '@nestjs/graphql';
import { IsEthereumAddress, IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class WalletUpsertInput {
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  @Field(() => String, { description: 'Wallet address' })
  address!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Field(() => String, { description: 'Wallet name' })
  name!: string;
}
