import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  CreateTicketData,
  ListTicketsFilter,
  TicketRepositoryInterface,
} from '../../domain/interfaces/ticket-repository.interface';
import { Ticket } from '../../domain/entities/ticket.entity';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketStatus } from '@ticketapp/shared-types';
import { TicketStatusMapper } from '../mappers/ticket-status.mapper';

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

  async updateStatus(id: string, status: TicketStatus, resolvedAt?: Date | null): Promise<Ticket> {
    const record = await this.prisma.ticketModel.update({
      where: { id },
      data: {
        status: TicketStatusMapper.toPersistence(status),
        ...(resolvedAt !== undefined ? { resolvedAt } : {}),
      },
    });
    return TicketMapper.toDomain(record);
  }

  async findAll(
    skip: number,
    take: number,
    filter: ListTicketsFilter,
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const where = {
      ...(filter.projectId ? { projectId: filter.projectId } : {}),
      ...(filter.createdBy ? { createdBy: filter.createdBy } : {}),
      ...(filter.memberOfProjectUserId
        ? { project: { members: { some: { userId: filter.memberOfProjectUserId } } } }
        : {}),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.ticketModel.findMany({ where, skip, take }),
      this.prisma.ticketModel.count({ where }),
    ]);

    return {
      tickets: records.map(TicketMapper.toDomain),
      total,
    };
  }
}
