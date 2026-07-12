import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Post(':key')
  set(@Param('key') key: string, @Body('value') value: string) {
    return this.settingsService.set(key, value);
  }

  @Post()
  updateMany(@Body() settings: Record<string, string>) {
    return this.settingsService.updateMany(settings);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}
