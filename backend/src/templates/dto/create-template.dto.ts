import {
  IsString,
  IsOptional,
  IsIn,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'welcome_message' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['marketing', 'utility', 'authentication'] })
  @IsOptional()
  @IsIn(['marketing', 'utility', 'authentication'])
  category?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'Hello {{1}}, welcome to our service!' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ example: 'Header text' })
  @IsOptional()
  @IsString()
  header?: string;

  @ApiPropertyOptional({ example: 'Footer text' })
  @IsOptional()
  @IsString()
  footer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  buttons?: any[];
}
