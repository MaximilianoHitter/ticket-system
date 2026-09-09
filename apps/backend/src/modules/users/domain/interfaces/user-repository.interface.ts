import { Role } from '@ticketapp/shared-types';
import { User } from '../entities/user.entity';
import { EditUserInput } from '@modules/users/application/edit-user.use-case';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UpdateUserData {
  name: string;
  passwordHash: string;
  role: Role;
}

export interface UserRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  findAll(
    skip: number,
    take: number,
    role?: Role,
    email?: string,
  ): Promise<{ users: User[]; total: number }>;
  update(id: string, data: UpdateUserData): Promise<User>;
}
