import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        tags: JSON.stringify(dto.tags || []),
        notes: dto.notes,
        source: dto.source,
        customFields: JSON.stringify(dto.customFields || {}),
      },
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    tag?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tag) {
      where.tags = { contains: tag };
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    const mapped = customers.map((c) => ({
      ...c,
      tags: JSON.parse(c.tags),
      customFields: JSON.parse(c.customFields),
    }));

    return {
      data: mapped,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        conversations: {
          include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
          orderBy: { lastMessageAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      ...customer,
      tags: JSON.parse(customer.tags),
      customFields: JSON.parse(customer.customFields),
    };
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.phone) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.tags) data.tags = JSON.stringify(dto.tags);
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.customFields) data.customFields = JSON.stringify(dto.customFields);

    const customer = await this.prisma.customer.update({
      where: { id },
      data,
    });

    return {
      ...customer,
      tags: JSON.parse(customer.tags),
      customFields: JSON.parse(customer.customFields),
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Customer deleted successfully' };
  }

  async bulkImport(customers: CreateCustomerDto[]) {
    const results = [];
    for (const customer of customers) {
      const existing = await this.prisma.customer.findFirst({
        where: { phone: customer.phone },
      });
      if (existing) {
        results.push({ phone: customer.phone, status: 'skipped', id: existing.id });
      } else {
        const created = await this.create(customer);
        results.push({ phone: customer.phone, status: 'created', id: created.id });
      }
    }
    return { imported: results.length, results };
  }

  async exportAll() {
    const customers = await this.prisma.customer.findMany();
    return customers.map((c) => ({
      ...c,
      tags: JSON.parse(c.tags),
      customFields: JSON.parse(c.customFields),
    }));
  }
}
