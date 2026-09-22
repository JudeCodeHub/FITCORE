import { Module } from '@nestjs/common';
import { MaintenanceTicketsController } from './maintenance-tickets.controller.js';
import { MaintenanceTicketsService } from './maintenance-tickets.service.js';

@Module({
  controllers: [MaintenanceTicketsController],
  providers: [MaintenanceTicketsService],
})
export class MaintenanceTicketsModule {}
