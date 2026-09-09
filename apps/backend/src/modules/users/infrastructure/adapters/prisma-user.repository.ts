import { Injectable } from '@nestjs/common';
import {
  UpdateUserData,
  UserRepositoryInterface,
} from '../../domain/interfaces/user-repository.interface';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { RoleMapper } from '../mappers/role.mapper';
import { Role } from '@ticketapp/shared-types';
import { EditUserInput } from '@modules/users/application/edit-user.use-case';

@Injectable()
export class PrismaUserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.userModel.findFirst({ where: { email, deletedAt: null } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.userModel.findFirst({ where: { id, deletedAt: null } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async save(user: User): Promise<User> {
    const record = await this.prisma.userModel.create({
      data: {
        id: user.getId(),
        email: user.getEmail(),
        name: user.getName(),
        password: user.getPassword(),
        role: RoleMapper.toPersistence(user.getRole()),
      },
    });
    return UserMapper.toDomain(record);
  }

  async findAll(
    skip: number,
    take: number,
    role?: Role,
    email?: string,
  ): Promise<{ users: User[]; total: number }> {
    const where = {
      deletedAt: null,
      ...(role ? { role: RoleMapper.toPersistence(role) } : {}),
      ...(email ? { email: { contains: email, mode: 'insensitive' as const } } : {}),
    };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.userModel.findMany({
        where,
        skip,
        take,
      }),
      this.prisma.userModel.count({
        where,
      }),
    ]);
    return {
      users: records.map(UserMapper.toDomain),
      total,
    };
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const record = await this.prisma.userModel.update({
      where: { id },
      data: {
        name: data.name,
        password: data.passwordHash,
        role: RoleMapper.toPersistence(data.role),
      },
    });
    return UserMapper.toDomain(record);
  }

  async deactivate(id: string): Promise<User> {
    const record = await this.prisma.userModel.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
    return UserMapper.toDomain(record);
  }
}
