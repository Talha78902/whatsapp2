import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        direction: dto.direction || 'inbound',
        content: dto.content,
        contentType: dto.contentType || 'text',
        mediaUrl: dto.mediaUrl,
        metadata: JSON.stringify(dto.metadata || {}),
      },
    });

    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async findByConversation(
    conversationId: string,
    page = 1,
    limit = 50,
  ) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return {
      data: messages,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
