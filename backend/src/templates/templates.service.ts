import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTemplateDto) {
    return this.prisma.template.create({
      data: {
        name: dto.name,
        category: dto.category || 'marketing',
        language: dto.language || 'en',
        body: dto.body,
        header: dto.header,
        footer: dto.footer,
        buttons: JSON.stringify(dto.buttons || []),
        status: 'pending',
      },
    });
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.template.count({ where }),
    ]);

    const mapped = templates.map((t) => ({
      ...t,
      buttons: JSON.parse(t.buttons),
    }));

    return {
      data: mapped,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return {
      ...template,
      buttons: JSON.parse(template.buttons),
    };
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.category) data.category = dto.category;
    if (dto.language) data.language = dto.language;
    if (dto.body) data.body = dto.body;
    if (dto.header !== undefined) data.header = dto.header;
    if (dto.footer !== undefined) data.footer = dto.footer;
    if (dto.buttons) data.buttons = JSON.stringify(dto.buttons);
    if (dto.status) data.status = dto.status;

    const template = await this.prisma.template.update({
      where: { id },
      data,
    });

    return { ...template, buttons: JSON.parse(template.buttons) };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.template.delete({ where: { id } });
    return { message: 'Template deleted successfully' };
  }
}
