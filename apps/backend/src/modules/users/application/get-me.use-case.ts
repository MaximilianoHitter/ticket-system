import { TokenPayload } from '@shared/token/domain/token.interface';
import { User } from '../domain/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../domain/interfaces/user-repository.interface';
import { UserNotFoundError } from '../domain/exceptions/user-not-found.error';

export interface GetMeInput {
  user: TokenPayload;
}

export interface GetMeOutput {
  user: User;
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(input: GetMeInput): Promise<GetMeOutput> {
    const user = await this.userRepository.findById(input.user.userId);
    if (!user) throw new UserNotFoundError();
    return { user };
  }
}
