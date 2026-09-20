export type PtSessionStatus = "BOOKED" | "CANCELLED";

export interface IPtSessionParty {
  id: string;
  name: string;
}

export interface IPtSession {
  id: string;
  trainerId: string;
  memberId: string;
  startTime: string;
  endTime: string;
  status: PtSessionStatus;
  cancelledAt: string | null;
  trainer: IPtSessionParty;
  member: IPtSessionParty;
}
