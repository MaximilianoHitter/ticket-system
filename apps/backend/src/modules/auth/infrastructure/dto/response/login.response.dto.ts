import { Role } from '@ticketapp/shared-types';
import { LoginOutput } from 'src/modules/auth/application/login.use-case';

export class LoginResponseDto {
  token!: string;
  user!: {
    id: string;
    email: string;
    role: Role;
  };

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
