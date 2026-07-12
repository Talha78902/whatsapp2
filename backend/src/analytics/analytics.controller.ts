import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('messages')
  @ApiQuery({ name: 'days', required: false, type: Number })
  getMessagesOverTime(@Query('days') days?: number) {
    return this.analyticsService.getMessagesOverTime(days || 30);
  }

  @Get('campaigns')
  getCampaignStats() {
    return this.analyticsService.getCampaignStats();
  }

  @Get('customers')
  @ApiQuery({ name: 'days', required: false, type: Number })
  getCustomerGrowth(@Query('days') days?: number) {
    return this.analyticsService.getCustomerGrowth(days || 30);
  }
}
