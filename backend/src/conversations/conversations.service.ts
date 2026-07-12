import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.assignedTo = userId;
    if (search) {
      where.customer = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      };
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, name: true, phone: true, tags: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, direction: true, createdAt: true },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    const mapped = conversations.map((c) => ({
      ...c,
      customer: {
        ...c.customer,
        tags: JSON.parse(c.customer.tags),
      },
    }));

    return {
      data: mapped,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return {
      ...conversation,
      customer: {
        ...conversation.customer,
        tags: JSON.parse(conversation.customer.tags),
        customFields: JSON.parse(conversation.customer.customFields),
      },
    };
  }

  async assign(id: string, userId: string) {
    await this.findOne(id);
    return this.prisma.conversation.update({
      where: { id },
      data: { assignedTo: userId, status: 'active' },
    });
  }

  async close(id: string) {
    await this.findOne(id);
    return this.prisma.conversation.update({
      where: { id },
      data: { status: 'closed' },
    });
  }

  async getStats() {
    const [active, closed, unassigned, total] = await Promise.all([
      this.prisma.conversation.count({ where: { status: 'active' } }),
      this.prisma.conversation.count({ where: { status: 'closed' } }),
      this.prisma.conversation.count({ where: { assignedTo: null } }),
      this.prisma.conversation.count(),
    ]);

    return { total, active, closed, unassigned };
  }
}
