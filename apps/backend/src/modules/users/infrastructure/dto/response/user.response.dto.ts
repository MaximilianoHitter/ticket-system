import { CreateUserOutput } from '@modules/users/application/create-user.use-case';
import { User } from '@modules/users/domain/entities/user.entity';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: string;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.getId();
    dto.email = user.getEmail();
    dto.name = user.getName();
    dto.role = user.getRole();
    return dto;
  }

  static fromOutput(output: CreateUserOutput): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = output.user.getId();
    dto.email = output.user.getEmail();
    dto.name = output.user.getName();
    dto.role = output.user.getRole();
    return dto;
  }
}
