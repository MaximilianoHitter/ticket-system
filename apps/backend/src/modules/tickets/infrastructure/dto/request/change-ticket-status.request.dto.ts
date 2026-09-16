import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TicketStatus } from '@ticketapp/shared-types';

export class ChangeTicketStatusRequestDto {
  @ApiProperty({ enum: TicketStatus, example: TicketStatus.IN_PROGRESS })
  @IsEnum(TicketStatus)
  @IsNotEmpty({ message: 'El estado objetivo es requerido' })
  status!: TicketStatus;
}
