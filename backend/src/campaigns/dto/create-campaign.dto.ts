import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale 2026' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Promotional campaign for summer sale' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'marketing', enum: ['marketing', 'utility', 'service'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({ example: ['customer-uuid-1', 'customer-uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  customerIds: string[];
}
