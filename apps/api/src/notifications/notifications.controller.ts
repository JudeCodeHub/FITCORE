import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.notificationsService.findAllForUser(user.sub);
  }

  @Get('me/unread-count')
  countUnread(@CurrentUser() user: RequestUser) {
    return this.notificationsService.countUnread(user.sub);
  }

  @Patch('me/:id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.notificationsService.markRead(id, user.sub);
  }

  @Post('me/read-all')
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.notificationsService.markAllRead(user.sub);
  }

  @Delete('me/:id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.notificationsService.remove(id, user.sub);
  }
}
