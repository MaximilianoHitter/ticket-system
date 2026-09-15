import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  RecordTicketChangeData,
  TicketHistoryRepositoryInterface,
} from '../../domain/interfaces/ticket-history-repository.interface';
import { Prisma } from 'src/generated/prisma/browser';

@Injectable()
export class PrismaTicketHistoryRepository implements TicketHistoryRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async record(id: string, data: RecordTicketChangeData): Promise<void> {
    await this.prisma.ticketHistoryModel.create({
      data: {
        id,
        ticketId: data.ticketId,
        changedBy: data.changedBy,
        previousData: data.previousData as Prisma.InputJsonValue,
        newData: data.newData as Prisma.InputJsonValue,
      },
    });
  }
}
