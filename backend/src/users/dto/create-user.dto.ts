import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'agent', enum: ['admin', 'agent'] })
  @IsOptional()
  @IsIn(['admin', 'agent'])
  role?: string;
}
