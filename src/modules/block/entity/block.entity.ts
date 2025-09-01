import { TransactionEntity } from '@/modules/block/entity/transaction.entity';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BlockEntity {
  @Field(() => String, { description: 'Base fee per gas', nullable: true })
  baseFeePerGas!: string | null;

  @Field(() => String, { description: 'Total used blob gas by all transactions in this block', nullable: true })
  blobGasUsed!: string | null;

  @Field(() => String, { description: 'Difficulty for this block' })
  difficulty!: string;

  @Field(() => String, { description: 'Excess blob gas', nullable: true })
  excessBlobGas!: string | null;

  @Field(() => String, { description: '"Extra data" field of this block ' })
  extraData!: string;

  @Field(() => Int, { description: 'Maximum gas allowed in this block' })
  gasLimit!: number;

  @Field(() => Int, { description: 'Total used gas by all transactions in this ' })
  gasUsed!: number;

  @Field(() => String, { description: 'Block hash or `null` if pending' })
  hash!: string;

  @Field(() => String, { description: 'Logs bloom filter or `null` if pending' })
  logsBloom!: string;

  @Field(() => String, { description: 'Address that received this block’s mining rewards, COINBASE address' })
  miner!: string;

  @Field(() => String, { description: 'Proof-of-work hash or `null` if pending', nullable: true })
  mixHash!: string | null;

  @Field(() => String, { description: 'Proof-of-work hash or `null` if pending', nullable: true })
  nonce!: string | null;

  @Field(() => String, { description: 'Block number or `null` if pending', nullable: true })
  number!: string | null;

  @Field(() => String, { description: 'Root of the parent beacon chain block', nullable: true })
  parentBeaconBlockRoot!: string | null;

  @Field(() => String, { description: 'Parent block hash' })
  parentHash!: string;

  @Field(() => String, { description: 'Root of the this block’s receipts trie' })
  receiptsRoot!: string;

  @Field(() => [String], { description: 'Seal fields' })
  sealFields!: string[];

  @Field(() => String, { description: 'SHA3 of the uncles data in this block' })
  sha3Uncles!: string;

  @Field(() => Int, { description: 'Size of this block in bytes' })
  size!: number;

  @Field(() => String, { description: 'Root of this block’s final state trie' })
  stateRoot!: string;

  @Field(() => Int, { description: 'Unix timestamp of when this block was collated' })
  timestamp!: number;

  @Field(() => String, { description: 'Total difficulty of the chain until this block', nullable: true })
  totalDifficulty!: string | null;

  @Field(() => [TransactionEntity], { description: 'List of transaction objects or hashes' })
  transactions!: TransactionEntity[];

  @Field(() => String, { description: 'Root of this block’s transaction trie' })
  transactionsRoot!: string;

  @Field(() => [String], { description: 'List of uncle hashes' })
  uncles!: string[];

  // TODO Withdrawal Entity 추가
  // withdrawals?: Withdrawal[] | undefined
  // /** Root of the this block’s withdrawals trie */
  // withdrawalsRoot?: Hex | undefined
}

// "author": "0x1c1de7157ddc860028f3fdb3b4b4ba2e7e1ca243",
//       "baseFeePerGas": "7",
//       "difficulty": "340282366920938463463374607431768211454",
//       "emptySteps": "[]",
//       "extraData": "0xdb830303058c4f70656e457468657265756d86312e35382e31826c69",
//       "gasLimit": "12000000",
//       "gasUsed": "0",
//       "hash": "0xfb930c67ee88f9ffaa4d27b87974d8d1dc65c876338a6bb3316ce12ac8fe9510",
//       "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//       "miner": "0x1c1de7157ddc860028f3fdb3b4b4ba2e7e1ca243",
//       "number": "409360",
//       "parentHash": "0x0c3d0b982864aefec76d642955aa61bd93629604b18703d0b755f92d5df1b3ae",
//       "receiptsRoot": "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
//       "sealFields": [
//         "0x8422e70565",
//         "0xb84143166aca048e6b91d43e972252e08365b80279eea623ba7e613d8e965f71d29975cd31db8af02c309d235ef48c7aef44384d3e60539a82aef3da4cdeb20bcbec01",
//         "0xc0"
//       ],
//       "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
//       "signature": "43166aca048e6b91d43e972252e08365b80279eea623ba7e613d8e965f71d29975cd31db8af02c309d235ef48c7aef44384d3e60539a82aef3da4cdeb20bcbec01",
//       "size": "587",
//       "stateRoot": "0x46dd6af79849d3039f812286d3efae47eeeb264d4331cd732ec224a69dec1f2d",
//       "step": "585565541",
//       "timestamp": "1756696623",
//       "totalDifficulty": "139297989722755369403367029298268634455784331",
//       "transactions": [],
//       "transactionsRoot": "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
//       "uncles": [],
//       "nonce": null
