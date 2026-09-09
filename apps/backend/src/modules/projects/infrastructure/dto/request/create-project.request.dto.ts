import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateProjectInput } from '../../../application/create-project.use-case';

export class CreateProjectRequestDto {
  @ApiProperty({ example: 'Sistema de Tickets Internos', type: 'string' })
  @IsString({ message: 'El nombre debe ser alfanumérico' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name!: string;

  @ApiPropertyOptional({ example: 'Proyecto para gestión de soporte interno' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser alfanumérica' })
  description?: string;

  toInput(createdBy: string): CreateProjectInput {
    return {
      name: this.name,
      description: this.description,
      createdBy,
    };
  }
}
