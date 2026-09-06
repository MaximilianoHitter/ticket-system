import { Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../../domain/interfaces/user-repository.interface';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { RoleMapper } from '../mappers/role.mapper';

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
}
