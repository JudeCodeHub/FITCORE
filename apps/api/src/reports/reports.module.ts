import { Module } from '@nestjs/common';
import { CheckInsModule } from '../check-ins/check-ins.module.js';
import { ClassesModule } from '../classes/classes.module.js';
import { MembershipsModule } from '../memberships/memberships.module.js';
import { RevenueModule } from '../revenue/revenue.module.js';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';

@Module({
  imports: [RevenueModule, MembershipsModule, ClassesModule, CheckInsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
