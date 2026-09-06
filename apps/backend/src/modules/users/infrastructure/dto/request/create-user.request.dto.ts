import { CreateUserInput } from '@modules/users/application/create-user.use-case';
import { Role } from '@ticketapp/shared-types';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserRequestDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser alfanumérica' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener como mínimo 6 caracteres' })
  password!: string;

  @IsString({ message: 'El nombre debe ser alfanumérico' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name!: string;

  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(Role, { message: 'El rol solo puede ser ADMIN, GESTOR o CLIENTE' })
  role!: Role;

  toInput(): CreateUserInput {
    return {
      email: this.email,
      password: this.password,
      name: this.name,
      role: this.role,
    };
  }
}
