import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@ticketapp/shared-types';
import { LoginOutput } from 'src/modules/auth/application/login.use-case';

class LoginUserDto {
  @ApiProperty({ type: 'string', description: 'Id del usuario' })
  id!: string;

  @ApiProperty({ type: 'string', description: 'Email' })
  email!: string;

  @ApiProperty({ type: () => Role, description: 'Role', enum: Role })
  role!: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: 'string', description: 'Token' })
  token!: string;
  @ApiProperty({ type: () => LoginUserDto })
  user!: LoginUserDto;

  static fromOutput(output: LoginOutput): LoginResponseDto {
    const dto = new LoginResponseDto();
    dto.token = output.token;
    dto.user = {
      id: output.user.getId(),
      email: output.user.getEmail(),
      role: output.user.getRole(),
    };
    return dto;
  }
}
