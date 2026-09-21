import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard, type RequestUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { BodyMetricsService } from './body-metrics.service.js';
import { CreateBodyMetricDto } from './dto/create-body-metric.dto.js';

@Controller('body-metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BodyMetricsController {
  constructor(private readonly bodyMetricsService: BodyMetricsService) {}

  @Post('me')
  createMine(
    @Body() dto: CreateBodyMetricDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.bodyMetricsService.create(user.sub, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: RequestUser) {
    return this.bodyMetricsService.findAllForUser(user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.bodyMetricsService.remove(id, user);
  }
}
