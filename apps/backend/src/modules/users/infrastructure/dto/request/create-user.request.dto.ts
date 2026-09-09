import { CreateUserInput } from '@modules/users/application/create-user.use-case';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@ticketapp/shared-types';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserRequestDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @ApiProperty({ type: 'string', description: 'Email' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser alfanumérica' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener como mínimo 6 caracteres' })
  @ApiProperty({ type: 'string', description: 'Contraseña' })
  password!: string;

  @IsString({ message: 'El nombre debe ser alfanumérico' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @ApiProperty({ type: 'string', description: 'Nombre' })
  name!: string;

  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(Role, { message: 'El rol solo puede ser ADMIN, GESTOR o CLIENTE' })
  @ApiProperty({ type: () => Role, enum: Role, description: 'Role' })
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
