import { Inject, Injectable } from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../domain/interfaces/user-repository.interface';
import { UserNotFoundError } from '../domain/exceptions/user-not-found.error';

export interface GetUserByIdInput {
  id: string;
}

export interface GetUserByIdOutput {
  user: User;
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(input: GetUserByIdInput): Promise<GetUserByIdOutput> {
    const user = await this.userRepository.findById(input.id);
    if (!user) throw new UserNotFoundError();
    return { user };
  }
}
