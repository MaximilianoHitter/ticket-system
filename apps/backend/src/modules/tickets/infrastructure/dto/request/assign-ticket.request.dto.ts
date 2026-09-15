import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignTicketRequestDto {
  @ApiProperty({ type: 'string', description: 'Id del usuario a asignar' })
  @IsUUID('4', { message: 'El id del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El id del usuario es requerido' })
  assigneeId!: string;
}
