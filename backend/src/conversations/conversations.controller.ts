import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.conversationsService.findAll(
      page || 1,
      limit || 20,
      status,
      search,
      userId,
    );
  }

  @Get('stats')
  getStats() {
    return this.conversationsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.assign(id, userId);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.conversationsService.close(id);
  }
}
