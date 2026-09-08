import { Inject, Injectable } from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../domain/interfaces/user-repository.interface';
import { Role } from '@ticketapp/shared-types';

export interface ListUsersInput {
  skip: number;
  take: number;
  role?: Role;
  email?: string;
}

export interface ListUsersOutput {
  users: User[];
  total: number;
}

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const { users, total } = await this.userRepository.findAll(
      input.skip,
      input.take,
      input.role,
      input.email,
    );
    return { users, total };
  }
}
