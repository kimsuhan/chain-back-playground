import { TokenEntity } from '@/modules/token-factory/entity/token.entity';
import { TokenFactoryService } from '@/modules/token-factory/token-factory.service';
import { Query, Resolver } from '@nestjs/graphql';

@Resolver(() => TokenEntity)
export class TokenFactoryResolver {
  constructor(private readonly tokenFactoryService: TokenFactoryService) {}

  @Query(() => [TokenEntity])
  tokens() {
    return this.tokenFactoryService.findAll();
  }
}
