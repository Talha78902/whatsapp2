import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [totalCustomers, totalConversations, totalMessages, totalCampaigns] =
      await Promise.all([
        this.prisma.customer.count(),
        this.prisma.conversation.count(),
        this.prisma.message.count(),
        this.prisma.campaign.count(),
      ]);

    return {
      totalCustomers,
      totalConversations,
      totalMessages,
      totalCampaigns,
    };
  }

  async getMessagesOverTime(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const messages = await this.prisma.message.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, direction: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyStats: Record<string, { inbound: number; outbound: number }> =
      {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      dailyStats[key] = { inbound: 0, outbound: 0 };
    }

    for (const msg of messages) {
      const key = msg.createdAt.toISOString().split('T')[0];
      if (dailyStats[key]) {
        if (msg.direction === 'inbound') {
          dailyStats[key].inbound++;
        } else {
          dailyStats[key].outbound++;
        }
      }
    }

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }

  async getCampaignStats() {
    const campaigns = await this.prisma.campaign.findMany({
      select: {
        status: true,
        _count: { select: { messages: true } },
        messages: {
          select: { status: true },
        },
      },
    });

    const totalSent = campaigns.filter((c) => c.status === 'sent').length;
    const totalDelivered = campaigns.reduce(
      (sum, c) =>
        sum + c.messages.filter((m) => m.status === 'delivered').length,
      0,
    );
    const totalRead = campaigns.reduce(
      (sum, c) => sum + c.messages.filter((m) => m.status === 'read').length,
      0,
    );
    const totalFailed = campaigns.reduce(
      (sum, c) => sum + c.messages.filter((m) => m.status === 'failed').length,
      0,
    );

    return {
      totalCampaigns: campaigns.length,
      totalSent,
      totalDelivered,
      totalRead,
      totalFailed,
    };
  }

  async getCustomerGrowth(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const customers = await this.prisma.customer.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyStats: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split('T')[0];
      dailyStats[key] = 0;
    }

    for (const customer of customers) {
      const key = customer.createdAt.toISOString().split('T')[0];
      if (dailyStats[key] !== undefined) {
        dailyStats[key]++;
      }
    }

    return Object.entries(dailyStats).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
