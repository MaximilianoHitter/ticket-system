import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignMemberRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-...', type: 'string' })
  @IsUUID('4', { message: 'User id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El user id es requerido' })
  userId!: string;
}
