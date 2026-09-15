import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Ticket } from '../../../domain/entities/ticket.entity';
import { CreateTicketOutput } from '../../../application/create-ticket.use-case';

export class TicketResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty()
  createdBy!: string;

  @ApiPropertyOptional()
  assignedTo!: string | null;

  static fromEntity(ticket: Ticket): TicketResponseDto {
    const dto = new TicketResponseDto();
    dto.id = ticket.getId();
    dto.title = ticket.getTitle();
    dto.description = ticket.getDescription();
    dto.status = ticket.getStatus();
    dto.projectId = ticket.getProjectId();
    dto.createdBy = ticket.getCreatedBy();
    dto.assignedTo = ticket.getAssignedTo();
    return dto;
  }

  static fromOutput(output: CreateTicketOutput): TicketResponseDto {
    return TicketResponseDto.fromEntity(output.ticket);
  }
}
