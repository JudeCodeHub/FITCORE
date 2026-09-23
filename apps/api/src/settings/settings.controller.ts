import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { SettingsService } from './settings.service.js';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Open to any authenticated role — gym hours and the freeze/
  // cancellation policy numbers aren't sensitive, and members benefit
  // from being able to see the policy they're bound by.
  @Get()
  get() {
    return this.settingsService.get();
  }

  @Patch()
  @Roles('ADMIN')
  update(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.settingsService.update(user.sub, dto);
  }
}
