import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@ticketapp/shared-types';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class EditUserRequestDto {
  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser alfanumérico' })
  name?: string;

  @ApiPropertyOptional({ example: 'newPassword123', minLength: 6 })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser alfanumérica' })
  @MinLength(6, { message: 'La contraseña debe tener como mínimo 6 caracteres' })
  password?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role, { message: 'El role solo puede ser ADMIN, GESTOR o CLIENTE' })
  role?: Role;
}
