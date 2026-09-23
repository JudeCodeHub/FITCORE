export type ComplaintType = "COMPLAINT" | "SUGGESTION";
export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface IComplaintUser {
  id: string;
  name: string;
  role: string;
}

export interface IComplaint {
  id: string;
  submittedById: string;
  submittedBy: IComplaintUser;
  type: ComplaintType;
  subject: string;
  message: string;
  status: ComplaintStatus;
  resolvedById: string | null;
  resolvedBy: IComplaintUser | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateComplaintInput {
  type: ComplaintType;
  subject: string;
  message: string;
}
