export interface IAvailabilityWindow {
  id: string;
  trainerId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
}

export interface IAvailabilityInput {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
}
