import { Role } from '@ticketapp/shared-types';
import { User } from '../domain/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../domain/interfaces/user-repository.interface';
import { UserNotFoundError } from '../domain/exceptions/user-not-found.error';
import { TokenPayload } from '@shared/token/domain/token.interface';
import { HASHING_SERVICE, HashingServiceInterface } from '@shared/hashing/domain/hashing.interface';
import { ForbiddenActionError } from '@shared/domain/exceptions/forbidden-action-error';

export interface EditUserInput {
  targetUserId: string;
  requestingUser: TokenPayload;
  name?: string;
  password?: string;
  role?: Role;
}

export interface EditUserOutput {
  user: User;
}

@Injectable()
export class EditUserUseCase {
  private readonly ctx = EditUserUseCase.name;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(HASHING_SERVICE)
    private readonly hashingService: HashingServiceInterface,
  ) {}

  async execute(input: EditUserInput): Promise<EditUserOutput> {
    const targetUser = await this.userRepository.findById(input.targetUserId);
    if (!targetUser) throw new UserNotFoundError();

    const isAdmin = input.requestingUser.role === Role.ADMIN;
    const isSelf = input.requestingUser.userId === input.targetUserId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenActionError();
    }

    if (!isAdmin && input.role !== undefined) {
      throw new ForbiddenActionError();
    }

    const updatedPasswordHash = input.password
      ? await this.hashingService.hash(input.password)
      : targetUser.getPassword();

    const updatedUser = await this.userRepository.update(input.targetUserId, {
      name: input.name ?? targetUser.getName(),
      passwordHash: updatedPasswordHash,
      role: isAdmin && input.role !== undefined ? input.role : targetUser.getRole(),
    });

    return { user: updatedUser };
  }
}
