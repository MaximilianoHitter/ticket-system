import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { LoginInput } from 'src/modules/auth/application/login.use-case';

export class LoginRequestDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @ApiProperty({
    type: 'string',
    description: 'Email',
  })
  email!: string;

  @IsString({ message: 'La contraseña debe ser alfanumérica' })
  @MinLength(6, { message: 'La contraseña debe tener como mínimo 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @ApiProperty({
    type: 'string',
    description: 'Contraseña',
  })
  password!: string;

  toInput(): LoginInput {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
