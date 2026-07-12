import { IsString, IsOptional, IsIn, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'welcome_message' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['marketing', 'utility', 'authentication'] })
  @IsOptional()
  @IsIn(['marketing', 'utility', 'authentication'])
  category?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'Hello {{1}}, welcome to our service!' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  header?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  footer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  buttons?: any[];

  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected'] })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: string;
}
