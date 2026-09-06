import { UserModel } from 'src/generated/prisma/browser';
import { User } from '../../domain/entities/user.entity';
import { RoleMapper } from './role.mapper';

export class UserMapper {
  static toDomain(prismaUser: UserModel): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.name,
      RoleMapper.toDomain(prismaUser.role),
      prismaUser.deletedAt,
    );
  }
}
