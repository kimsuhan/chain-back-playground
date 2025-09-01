import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TransactionEntity {
  @Field(() => [String], { description: 'Transaction access list', nullable: true })
  accessList!: string[] | null;

  @Field(() => String, { description: 'Transaction block hash' })
  blockHash!: string;

  @Field(() => String, { description: 'Transaction block number' })
  blockNumber!: string;

  @Field(() => String, { description: 'Transaction chain id' })
  chainId!: string;

  @Field(() => String, { description: 'Transaction condition', nullable: true })
  condition!: string | null;

  @Field(() => String, { description: 'Transaction creates', nullable: true })
  creates!: string | null;

  @Field(() => String, { description: 'Transaction from' })
  from!: string;

  @Field(() => String, { description: 'Transaction gas' })
  gas!: string;

  @Field(() => String, { description: 'Transaction gas price' })
  gasPrice!: string;

  @Field(() => String, { description: 'Transaction hash' })
  hash!: string;

  @Field(() => String, { description: 'Transaction input' })
  input!: string;

  @Field(() => String, { description: 'Transaction max fee per gas', nullable: true })
  maxFeePerGas!: string | null;

  @Field(() => String, { description: 'Transaction max priority fee per gas', nullable: true })
  maxPriorityFeePerGas!: string | null;

  @Field(() => String, { description: 'Transaction nonce' })
  nonce!: string;

  @Field(() => String, { description: 'Transaction public key' })
  publicKey!: string;

  @Field(() => String, { description: 'Transaction r' })
  r!: string;

  @Field(() => String, { description: 'Transaction raw' })
  raw!: string;

  @Field(() => String, { description: 'Transaction s' })
  s!: string;

  @Field(() => String, { description: 'Transaction to', nullable: true })
  to!: string | null;

  @Field(() => String, { description: 'Transaction transaction index' })
  transactionIndex!: string;

  @Field(() => String, { description: 'Transaction type' })
  type!: string;

  @Field(() => String, { description: 'Transaction v' })
  v!: string;

  @Field(() => String, { description: 'Transaction value' })
  value!: string;

  @Field(() => String, { description: 'Transaction type hex' })
  typeHex!: string;

  @Field(() => String, { description: 'Transaction y parity', nullable: true })
  yParity!: string | null;
}
