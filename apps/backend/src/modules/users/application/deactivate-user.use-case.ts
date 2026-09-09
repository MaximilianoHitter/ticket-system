import { TokenPayload } from '@shared/token/domain/token.interface';
import { User } from '../domain/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../domain/interfaces/user-repository.interface';
import { UserNotFoundError } from '../domain/exceptions/user-not-found.error';
import { ForbiddenActionError } from '@shared/domain/exceptions/forbidden-action-error';
import { UserAlreadyDeactivatedError } from '../domain/exceptions/user-alterady-deactivated.error';

export interface DeactivateUserInput {
  targetUserId: string;
  requestingUser: TokenPayload;
}

export interface DeactivateUserOutput {
  user: User;
}

@Injectable()
export class DeactivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(input: DeactivateUserInput): Promise<DeactivateUserOutput> {
    const targetUser = await this.userRepository.findById(input.targetUserId);
    if (!targetUser) throw new UserNotFoundError();

    if (input.requestingUser.userId === input.targetUserId) {
      throw new ForbiddenActionError('No puede desactivarse el usuario mismo');
    }

    if (targetUser.isDeleted()) {
      throw new UserAlreadyDeactivatedError();
    }

    const user = await this.userRepository.deactivate(input.targetUserId);

    return { user };
  }
}
