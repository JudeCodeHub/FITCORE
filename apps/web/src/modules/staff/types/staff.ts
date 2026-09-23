export type StaffRole = "ADMIN" | "TRAINER" | "FRONT_DESK";

export interface IStaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

export interface IInviteStaffInput {
  email: string;
  role: StaffRole;
}
