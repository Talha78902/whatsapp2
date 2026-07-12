import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalConversations,
      activeConversations,
      todayMessages,
      totalCampaigns,
      recentConversations,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.conversation.count(),
      this.prisma.conversation.count({ where: { status: 'active' } }),
      this.prisma.message.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.campaign.count(),
      this.prisma.conversation.findMany({
        take: 5,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true, tags: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true },
          },
        },
      }),
    ]);

    const mappedConversations = recentConversations.map((c) => ({
      ...c,
      customer: {
        ...c.customer,
        tags: JSON.parse(c.customer.tags),
      },
    }));

    return {
      totalCustomers,
      totalConversations,
      activeConversations,
      todayMessages,
      totalCampaigns,
      recentConversations: mappedConversations,
    };
  }
}
