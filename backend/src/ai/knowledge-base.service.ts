import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeBaseService {
  constructor(private prisma: PrismaService) {}

  async create(question: string, answer: string, category = 'general') {
    return this.prisma.knowledgeBase.create({
      data: { question, answer, category },
    });
  }

  async findAll(page = 1, limit = 20, category?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.knowledgeBase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.knowledgeBase.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.knowledgeBase.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Knowledge base entry not found');
    }

    return item;
  }

  async update(
    id: string,
    data: { question?: string; answer?: string; category?: string; isActive?: boolean },
  ) {
    await this.findOne(id);
    return this.prisma.knowledgeBase.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.knowledgeBase.delete({ where: { id } });
    return { message: 'Knowledge base entry deleted' };
  }
}
