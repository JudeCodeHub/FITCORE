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

export interface IRevenueByPlan {
  planId: string;
  planName: string;
  activeCount: number;
  mrr: number;
}

export interface IRevenueSummary {
  totalMrr: number;
  activeMembershipCount: number;
  byPlan: IRevenueByPlan[];
}

export interface IMrrTrendPoint {
  month: string;
  mrr: number;
}

export interface IGrowthChurnPoint {
  month: string;
  activeAtStart: number;
  newMembers: number;
  churnedMembers: number;
  netGrowth: number;
  churnRatePercent: number | null;
}

export interface IGrowthChurnSummary {
  currentActiveCount: number;
  trend: IGrowthChurnPoint[];
}

export interface IClassAttendance {
  name: string;
  occurrenceCount: number;
  totalCapacity: number;
  totalAttended: number;
  totalWaitlisted: number;
  avgFillRatePercent: number;
}

export interface IAttendanceAnalytics {
  windowDays: number;
  since: string;
  until: string;
  classes: IClassAttendance[];
  mostPopular: IClassAttendance | null;
  leastPopular: IClassAttendance | null;
}
