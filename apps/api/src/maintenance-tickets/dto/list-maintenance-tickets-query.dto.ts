import { IsIn, IsOptional } from 'class-validator';
import { MAINTENANCE_TICKET_STATUSES } from './update-maintenance-ticket.dto.js';

export class ListMaintenanceTicketsQueryDto {
  @IsOptional()
  @IsIn(MAINTENANCE_TICKET_STATUSES)
  status?: (typeof MAINTENANCE_TICKET_STATUSES)[number];
}
