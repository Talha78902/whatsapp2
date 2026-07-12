import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { TemplatesModule } from './templates/templates.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { LogsModule } from './logs/logs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    CampaignsModule,
    ConversationsModule,
    MessagesModule,
    TemplatesModule,
    WhatsappModule,
    AiModule,
    AnalyticsModule,
    SettingsModule,
    LogsModule,
    DashboardModule,
  ],
})
export class AppModule {}
