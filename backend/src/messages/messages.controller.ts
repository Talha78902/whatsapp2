import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.messagesService.create(dto);
  }

  @Get('conversation/:conversationId')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByConversation(
    @Param('conversationId') conversationId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.findByConversation(
      conversationId,
      page || 1,
      limit || 50,
    );
  }
}
