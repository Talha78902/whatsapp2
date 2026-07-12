import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Knowledge Base')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private kbService: KnowledgeBaseService) {}

  @Post()
  create(
    @Body('question') question: string,
    @Body('answer') answer: string,
    @Body('category') category?: string,
  ) {
    return this.kbService.create(question, answer, category);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
  ) {
    return this.kbService.findAll(page || 1, limit || 20, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kbService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: { question?: string; answer?: string; category?: string; isActive?: boolean },
  ) {
    return this.kbService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kbService.remove(id);
  }
}
