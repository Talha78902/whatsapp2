import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataStoreService } from '../common/data-store.service';

@Injectable()
export class PrismaService extends DataStoreService implements OnModuleInit {
  user = this.createModel('user');
  customer = this.createModel('customer');
  campaign = this.createModel('campaign');
  campaignMessage = this.createModel('campaignMessages');
  conversation = this.createModel('conversation');
  message = this.createModel('message');
  template = this.createModel('template');
  setting = this.createModel('setting');
  knowledgeBase = this.createModel('knowledgeBase');
  log = this.createModel('log');

  private createModel(modelName: string) {
    const service = this;
    return {
      findUnique: (args: any) => service.findUnique(modelName, args),
      findFirst: (args: any) => service.findFirst(modelName, args),
      findMany: (args?: any) => service.findMany(modelName, args || {}),
      create: (args: any) => service.create(modelName, args),
      createMany: (args: any) => service.createMany(modelName, args),
      update: (args: any) => service.update(modelName, args),
      updateMany: (args: any) => service.updateMany(modelName, args),
      delete: (args: any) => service.delete(modelName, args),
      count: (args?: any) => service.count(modelName, args),
      upsert: (args: any) => service.upsert(modelName, args),
    };
  }

  async onModuleInit() {
    const existing = this.findUnique('user', { where: { email: 'admin@talha.com' } as any });
    if (!existing) {
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('admin123', 12);
      this.create('user', {
        data: {
          email: 'admin@talha.com',
          passwordHash: hash,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
        },
      } as any);
    }

    const settingsCount = this.count('setting');
    if (settingsCount === 0) {
      this.create('setting', { data: { key: 'business_name', value: 'Talha Business' } } as any);
      this.create('setting', { data: { key: 'business_hours', value: 'Mon-Fri 9AM-6PM' } } as any);
      this.create('setting', { data: { key: 'ai_enabled', value: 'true' } } as any);
      this.create('setting', { data: { key: 'default_language', value: 'en' } } as any);
    }

    console.log('In-memory data store initialized with seed data');
  }
}
