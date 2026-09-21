import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CheckInsService } from './check-ins.service.js';
import { CreateCheckInDto } from './dto/create-check-in.dto.js';

@Controller('check-ins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'FRONT_DESK')
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreateCheckInDto) {
    return this.checkInsService.create(dto);
  }

  @Get('recent')
  findRecent() {
    return this.checkInsService.findRecent();
  }

  @Get('active')
  findActive() {
    return this.checkInsService.findActive();
  }
}
