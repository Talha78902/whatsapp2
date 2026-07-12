import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [ConfigService, LoggerService],
  exports: [ConfigService, LoggerService],
})
export class CommonModule {}
