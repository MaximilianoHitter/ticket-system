import { Role } from '@ticketapp/shared-types';
import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

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
}
