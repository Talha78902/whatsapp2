import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('reply/:conversationId')
  generateReply(
    @Param('conversationId') conversationId: string,
    @Body('message') message: string,
  ) {
    return this.aiService.generateReply(conversationId, message);
  }

  @Get('suggestions/:conversationId')
  getSuggestions(@Param('conversationId') conversationId: string) {
    return this.aiService.generateSuggestedReply(conversationId);
  }

  @Get('summarize/:conversationId')
  summarize(@Param('conversationId') conversationId: string) {
    return this.aiService.summarizeConversation(conversationId);
  }

  @Post('ask')
  ask(@Body('question') question: string) {
    return this.aiService.answerFromKnowledgeBase(question);
  }
}
