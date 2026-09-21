import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { LogPersonalRecordDto } from './dto/log-personal-record.dto.js';
import { PersonalRecordsService } from './personal-records.service.js';

@Controller('personal-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonalRecordsController {
  constructor(private readonly personalRecordsService: PersonalRecordsService) {}

  @Post('me')
  createMine(
    @Body() dto: LogPersonalRecordDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.personalRecordsService.create(user.sub, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.personalRecordsService.findAllForUser(user.sub);
  }

  @Get('me/best')
  findMyBest(@CurrentUser() user: RequestUser) {
    return this.personalRecordsService.findBestForUser(user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.personalRecordsService.remove(id, user);
  }
}
