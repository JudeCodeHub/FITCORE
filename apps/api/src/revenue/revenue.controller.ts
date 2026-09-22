import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RevenueService } from './revenue.service.js';

@Controller('revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get('summary')
  getSummary() {
    return this.revenueService.getSummary();
  }

  @Get('mrr-trend')
  getMrrTrend(@Query('months') months?: string) {
    return this.revenueService.getMrrTrend(months ? Number(months) : undefined);
  }
}
