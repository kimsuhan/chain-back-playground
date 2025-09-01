import { PUB_SUB } from '@/app.provider';
import { BlockService } from '@/modules/block/block.service';
import { BlockEntity } from '@/modules/block/entity/block.entity';
import { TransactionEntity } from '@/modules/block/entity/transaction.entity';
import { Inject } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => BlockEntity)
export class BlockResolver {
  constructor(
    private readonly blockService: BlockService,
    @Inject(PUB_SUB) private pubSub: PubSub,
  ) {}

  @Query(() => [BlockEntity])
  blocks() {
    console.log('all here');
    return this.blockService.findAllBlock();
  }

  @Query(() => BlockEntity, { nullable: true })
  block(@Args('blockNumber') blockNumber: number): Promise<BlockEntity | null> {
    console.log('here');
    return this.blockService.findOneBlock(blockNumber);
  }

  @Subscription(() => BlockEntity)
  newBlock() {
    return this.pubSub.asyncIterableIterator('newBlock');
  }

  @Query(() => [TransactionEntity])
  transactions() {
    return this.blockService.findAllTransaction();
  }
}
