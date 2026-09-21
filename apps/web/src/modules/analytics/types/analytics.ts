export interface IPeakHoursPeak {
  dayOfWeek: number;
  hourOfDay: number;
  count: number;
}

export interface IPeakHours {
  grid: number[][];
  peak: IPeakHoursPeak;
  windowDays: number;
}
