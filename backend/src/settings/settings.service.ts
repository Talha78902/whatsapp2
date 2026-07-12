import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const settings = await this.prisma.setting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async get(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting '${key}' not found`);
    }
    return setting;
  }

  async set(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async updateMany(settings: Record<string, string>) {
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return this.findAll();
  }

  async delete(key: string) {
    await this.get(key);
    await this.prisma.setting.delete({ where: { key } });
    return { message: `Setting '${key}' deleted` };
  }
}
