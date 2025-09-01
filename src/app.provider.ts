import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB = 'PUB_SUB';
export const PUB_SUB_PROVIDER = {
  provide: PUB_SUB,
  useValue: new PubSub(),
};
