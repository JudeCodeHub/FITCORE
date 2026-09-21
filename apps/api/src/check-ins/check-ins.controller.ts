import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CheckInsService } from './check-ins.service.js';
import { CreateCheckInDto } from './dto/create-check-in.dto.js';

@Controller('check-ins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'FRONT_DESK')
  create(@Body() dto: CreateCheckInDto) {
    return this.checkInsService.create(dto);
  }

  @Get('recent')
  @Roles('ADMIN', 'FRONT_DESK')
  findRecent() {
    return this.checkInsService.findRecent();
  }

  @Get('active')
  @Roles('ADMIN', 'FRONT_DESK')
  findActive() {
    return this.checkInsService.findActive();
  }

  @Get('peak-hours')
  @Roles('ADMIN')
  getPeakHours(@Query('days') days?: string) {
    return this.checkInsService.getPeakHours(days ? Number(days) : undefined);
  }

  // Must be registered before any dynamic ':id'-style route were one ever
  // added — otherwise Nest would try to match "/check-ins/me" as that param.
  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.checkInsService.findMine(user.sub);
  }
}
