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

export interface ITrainerUtilization {
  windowDays: number;
  since: string;
  until: string;
  sessionsRun: {
    ptSessions: number;
    classes: number;
    total: number;
  };
  hours: {
    booked: number;
    available: number;
    utilizationPercent: number | null;
  };
}
