import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsUUID()
  conversationId: string;

  @ApiProperty({ example: 'Hello, how can I help you?' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: ['inbound', 'outbound'] })
  @IsOptional()
  @IsIn(['inbound', 'outbound'])
  direction?: string;

  @ApiPropertyOptional({ enum: ['text', 'image', 'video', 'document', 'audio'] })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
