import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';

@Module({
  controllers: [AiController, KnowledgeBaseController],
  providers: [AiService, KnowledgeBaseService],
  exports: [AiService, KnowledgeBaseService],
})
export class AiModule {}
