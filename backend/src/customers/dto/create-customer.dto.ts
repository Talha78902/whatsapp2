import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: ['vip', 'new'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Interested in premium plan' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'website' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
