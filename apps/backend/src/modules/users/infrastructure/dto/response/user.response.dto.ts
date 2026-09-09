import { CreateUserOutput } from '@modules/users/application/create-user.use-case';
import { User } from '@modules/users/domain/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@ticketapp/shared-types';

export class UserResponseDto {
  @ApiProperty({ type: 'string', description: 'Id del usuario' })
  id!: string;
  @ApiProperty({ type: 'string', description: 'Email' })
  email!: string;
  @ApiProperty({ type: 'string', description: 'Nombre' })
  name!: string;
  @ApiProperty({ type: 'string', enum: Role, description: 'Role' })
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
