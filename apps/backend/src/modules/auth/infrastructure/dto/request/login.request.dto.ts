import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginInput } from 'src/modules/auth/application/login.use-case';

export class LoginRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  toInput(): LoginInput {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
