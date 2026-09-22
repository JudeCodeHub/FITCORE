import { IsIn } from 'class-validator';

export const MAINTENANCE_TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
] as const;

export class UpdateMaintenanceTicketDto {
  @IsIn(MAINTENANCE_TICKET_STATUSES)
  status!: (typeof MAINTENANCE_TICKET_STATUSES)[number];
}
