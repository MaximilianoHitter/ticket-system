import { CreateUserOutput } from '@modules/users/application/create-user.use-case';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: string;

  static fromOutput(output: CreateUserOutput): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = output.user.getId();
    dto.email = output.user.getEmail();
    dto.name = output.user.getName();
    dto.role = output.user.getRole();
    return dto;
  }
}
