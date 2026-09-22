export { PeakHoursPage } from "./pages/peak-hours";
export { TrainerUtilizationPage } from "./pages/trainer-utilization";
export { RevenuePage } from "./pages/revenue";
export { GrowthPage } from "./pages/growth";
export { AttendancePage } from "./pages/attendance";
export { analyticsService } from "./services/analytics.service";
export type {
  IAttendanceAnalytics,
  IClassAttendance,
  IGrowthChurnPoint,
  IGrowthChurnSummary,
  IMrrTrendPoint,
  IPeakHours,
  IPeakHoursPeak,
  IRevenueByPlan,
  IRevenueSummary,
  ITrainerUtilization,
} from "./types/analytics";
