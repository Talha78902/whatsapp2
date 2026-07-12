import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private whatsappService: WhatsappService) {}

  @Public()
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.whatsappService.verifyWebhook(mode, token, challenge);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() body: any) {
    return this.whatsappService.handleWebhook(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  @ApiBearerAuth()
  async sendMessage(
    @Body('phoneNumber') phoneNumber: string,
    @Body('message') message: string,
  ) {
    return this.whatsappService.sendMessage(phoneNumber, message);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-template')
  @ApiBearerAuth()
  async sendTemplate(
    @Body('phoneNumber') phoneNumber: string,
    @Body('templateName') templateName: string,
    @Body('languageCode') languageCode?: string,
    @Body('parameters') parameters?: string[],
  ) {
    return this.whatsappService.sendTemplate(
      phoneNumber,
      templateName,
      languageCode || 'en',
      parameters || [],
    );
  }
}
