import type { IClass } from "@/modules/classes";

export type BookingStatus = "BOOKED" | "WAITLISTED" | "CANCELLED";

export interface IMyBooking {
  id: string;
  classId: string;
  userId: string;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt: string | null;
  canCancel: boolean;
  waitlistPosition?: number;
  class: IClass;
}

export interface IBookingResult {
  id: string;
  classId: string;
  userId: string;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt: string | null;
  waitlistPosition?: number;
}
