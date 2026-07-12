import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get port(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  get databaseUrl(): string {
    return process.env.DATABASE_URL || '';
  }

  get redisUrl(): string {
    return process.env.REDIS_URL || 'redis://localhost:6379';
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'super-secret-key';
  }

  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '15m';
  }

  get jwtRefreshExpiresIn(): string {
    return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  get whatsappApiVersion(): string {
    return process.env.WHATSAPP_API_VERSION || 'v21.0';
  }

  get whatsappPhoneNumberId(): string {
    return process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  get whatsappBusinessAccountId(): string {
    return process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
  }

  get whatsappAccessToken(): string {
    return process.env.WHATSAPP_ACCESS_TOKEN || '';
  }

  get whatsappWebhookVerifyToken(): string {
    return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '';
  }

  get openaiApiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  get openaiModel(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  get corsOrigin(): string {
    return process.env.CORS_ORIGIN || 'http://localhost:5173';
  }

  get cookieSecret(): string {
    return process.env.COOKIE_SECRET || 'cookie-secret';
  }
}
