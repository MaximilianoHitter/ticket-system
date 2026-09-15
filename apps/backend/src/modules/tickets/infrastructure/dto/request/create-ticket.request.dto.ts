import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTicketRequestDto {
  @ApiProperty({ example: 'No puedo acceder a mi cuenta' })
  @IsString({ message: 'El título debe ser alfanumérico' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @MinLength(3, { message: 'El título debe tener como mínimo 3 caracteres' })
  title!: string;

  @ApiProperty({ example: 'Al intentar loguearme me da error 500' })
  @IsString({ message: 'La descripción debe ser alfanumérica' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(10, { message: 'La descripción debe tener como mínimo 10 caracteres' })
  description!: string;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsNotEmpty({ message: 'Se debe asignar a un proyecto' })
  @IsUUID('4', { message: 'El id del proyecto debe ser un UUID válido' })
  projectId!: string;
}
