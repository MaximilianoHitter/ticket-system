import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  CreateTicketData,
  TicketRepositoryInterface,
} from '../../domain/interfaces/ticket-repository.interface';
import { Ticket } from '../../domain/entities/ticket.entity';
import { TicketMapper } from '../mappers/ticket.mapper';

@Injectable()
export class PrismaTicketRepository implements TicketRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Ticket | null> {
    const record = await this.prisma.ticketModel.findUnique({ where: { id } });
    return record ? TicketMapper.toDomain(record) : null;
  }

  async create(id: string, data: CreateTicketData): Promise<Ticket> {
    const record = await this.prisma.ticketModel.create({
      data: {
        id,
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        createdBy: data.createdBy,
      },
    });
    return TicketMapper.toDomain(record);
  }

  async updateAssignee(id: string, assignedTo: string): Promise<Ticket> {
    const record = await this.prisma.ticketModel.update({
      where: { id },
      data: { assignedTo, assignedAt: new Date() },
    });
    return TicketMapper.toDomain(record);
  }
}
