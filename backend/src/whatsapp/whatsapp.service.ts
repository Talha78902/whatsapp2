import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../common/config.service';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class WhatsappService {
  private baseUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.baseUrl = `https://graph.facebook.com/${this.configService.whatsappApiVersion}`;
  }

  async verifyWebhook(mode: string, token: string, challenge: string) {
    if (
      mode === 'subscribe' &&
      token === this.configService.whatsappWebhookVerifyToken
    ) {
      return challenge;
    }
    throw new ForbiddenException('Webhook verification failed');
  }

  async handleWebhook(body: any) {
    try {
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      if (!value) {
        return { message: 'No value in webhook payload' };
      }

      if (value.statuses) {
        await this.handleStatusUpdate(value.statuses);
      }

      if (value.messages) {
        await this.handleIncomingMessages(value.messages, value.metadata);
      }

      return { message: 'Webhook processed' };
    } catch (error) {
      this.logger.error(
        `Webhook processing error: ${error}`,
        (error as Error).stack,
      );
      return { message: 'Webhook processed with errors' };
    }
  }

  private async handleStatusUpdate(statuses: any[]) {
    for (const status of statuses) {
      const { id, status: deliveryStatus, timestamp } = status;

      await this.prisma.campaignMessage.updateMany({
        where: { whatsappId: id },
        data: {
          status: deliveryStatus,
          ...(deliveryStatus === 'sent' ? { sentAt: new Date(parseInt(timestamp) * 1000) } : {}),
          ...(deliveryStatus === 'delivered' ? { deliveredAt: new Date(parseInt(timestamp) * 1000) } : {}),
          ...(deliveryStatus === 'read' ? { readAt: new Date(parseInt(timestamp) * 1000) } : {}),
        },
      });

      await this.prisma.message.updateMany({
        where: { whatsappId: id },
        data: { status: deliveryStatus },
      });
    }
  }

  private async handleIncomingMessages(messages: any[], metadata: any) {
    for (const msg of messages) {
      const from = msg.from;
      let customer = await this.prisma.customer.findFirst({
        where: { phone: from },
      });

      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            phone: from,
            name: msg.profile?.name || from,
            source: 'whatsapp',
          },
        });
      }

      let conversation = await this.prisma.conversation.findFirst({
        where: {
          customerId: customer.id,
          status: { not: 'closed' },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            customerId: customer.id,
            status: 'active',
            lastMessageAt: new Date(),
          },
        });
      }

      const content =
        msg.text?.body ||
        msg.image?.caption ||
        msg.video?.caption ||
        (msg.type === 'interactive'
          ? JSON.stringify(msg.interactive)
          : 'Media message');

      const mediaUrl =
        msg.image?.id ||
        msg.video?.id ||
        msg.document?.id ||
        msg.audio?.id;

      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'inbound',
          content,
          contentType: msg.type || 'text',
          mediaUrl,
          whatsappId: msg.id,
          metadata: JSON.stringify(msg),
        },
      });

      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });
    }
  }

  async sendMessage(phoneNumber: string, message: string) {
    const phoneNumberId = this.configService.whatsappPhoneNumberId;
    const accessToken = this.configService.whatsappAccessToken;

    if (!phoneNumberId || !accessToken) {
      throw new Error('WhatsApp not configured');
    }

    const url = `${this.baseUrl}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`WhatsApp send error: ${error}`);
      throw new Error(`Failed to send message: ${error}`);
    }

    return response.json();
  }

  async sendTemplate(
    phoneNumber: string,
    templateName: string,
    languageCode: string = 'en',
    parameters: string[] = [],
  ) {
    const phoneNumberId = this.configService.whatsappPhoneNumberId;
    const accessToken = this.configService.whatsappAccessToken;

    if (!phoneNumberId || !accessToken) {
      throw new Error('WhatsApp not configured');
    }

    const url = `${this.baseUrl}/${phoneNumberId}/messages`;

    const templateComponents: any[] = [];

    if (parameters.length > 0) {
      templateComponents.push({
        type: 'body',
        parameters: parameters.map((param) => ({
          type: 'text',
          text: param,
        })),
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: templateComponents,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`WhatsApp template send error: ${error}`);
      throw new Error(`Failed to send template: ${error}`);
    }

    return response.json();
  }
}
