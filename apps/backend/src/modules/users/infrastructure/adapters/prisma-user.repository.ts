import { Injectable } from '@nestjs/common';
import { UserRepositoryInterface } from '../../domain/interfaces/user-repository.interface';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.userModel.findUnique({ where: { email } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.userModel.findUnique({ where: { id } });
    return record ? UserMapper.toDomain(record) : null;
  }
}
