import type { IEquipment } from "@/modules/equipment";

export type MaintenanceTicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface IStaffSummary {
  id: string;
  name: string;
  role: string;
}

export interface IMaintenanceTicket {
  id: string;
  equipmentId: string;
  equipment: IEquipment;
  reportedById: string;
  reportedBy: IStaffSummary;
  description: string;
  status: MaintenanceTicketStatus;
  resolvedById: string | null;
  resolvedBy: IStaffSummary | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateMaintenanceTicketInput {
  equipmentId: string;
  description: string;
}
