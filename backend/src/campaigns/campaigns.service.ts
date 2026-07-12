import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCampaignDto, userId: string) {
    const campaign = await this.prisma.campaign.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type || 'marketing',
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        templateId: dto.templateId,
        userId,
        messages: {
          create: dto.customerIds.map((customerId) => ({
            customerId,
          })),
        },
      },
      include: {
        messages: {
          include: { customer: { select: { id: true, name: true, phone: true } } },
        },
        template: true,
      },
    });

    return campaign;
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: string,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { messages: true } },
          template: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: campaigns,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        messages: {
          include: { customer: { select: { id: true, name: true, phone: true } } },
          orderBy: { createdAt: 'desc' },
        },
        template: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status) data.status = dto.status;
    if (dto.scheduledAt !== undefined) {
      data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    }
    if (dto.templateId !== undefined) data.templateId = dto.templateId;

    return this.prisma.campaign.update({
      where: { id },
      data,
      include: {
        messages: {
          include: { customer: { select: { id: true, name: true, phone: true } } },
        },
        template: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.campaign.delete({ where: { id } });
    return { message: 'Campaign deleted successfully' };
  }

  async getStats(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;

    const [total, draft, scheduled, sending, sent, cancelled] =
      await Promise.all([
        this.prisma.campaign.count({ where }),
        this.prisma.campaign.count({ where: { ...where, status: 'draft' } }),
        this.prisma.campaign.count({
          where: { ...where, status: 'scheduled' },
        }),
        this.prisma.campaign.count({
          where: { ...where, status: 'sending' },
        }),
        this.prisma.campaign.count({ where: { ...where, status: 'sent' } }),
        this.prisma.campaign.count({
          where: { ...where, status: 'cancelled' },
        }),
      ]);

    return { total, draft, scheduled, sending, sent, cancelled };
  }
}
