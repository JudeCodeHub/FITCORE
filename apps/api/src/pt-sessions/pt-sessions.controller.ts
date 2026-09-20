import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreatePtSessionDto } from './dto/create-pt-session.dto.js';
import { SelfBookPtSessionDto } from './dto/self-book-pt-session.dto.js';
import { PtSessionsService } from './pt-sessions.service.js';

@Controller('pt-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PtSessionsController {
  constructor(private readonly ptSessionsService: PtSessionsService) {}

  @Post('me')
  bookForSelf(
    @Body() dto: SelfBookPtSessionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.ptSessionsService.create({
      trainerId: dto.trainerId,
      memberId: user.sub,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });
  }

  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.ptSessionsService.findMine(user.sub);
  }

  @Post('me/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelMine(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.ptSessionsService.cancel(id, user);
  }

  @Post()
  @Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
  create(@Body() dto: CreatePtSessionDto) {
    return this.ptSessionsService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
  findAll() {
    return this.ptSessionsService.findAll();
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'TRAINER', 'FRONT_DESK')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.ptSessionsService.cancel(id, user);
  }
}
