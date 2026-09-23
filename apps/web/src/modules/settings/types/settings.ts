export interface IDayHours {
  open: string | null;
  close: string | null;
}

export interface IHours {
  monday: IDayHours;
  tuesday: IDayHours;
  wednesday: IDayHours;
  thursday: IDayHours;
  friday: IDayHours;
  saturday: IDayHours;
  sunday: IDayHours;
}

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export interface IGymSettings {
  id: string;
  name: string;
  timezone: string;
  hours: IHours;
  branches: string[];
  freezeDaysPerYearLimit: number;
  cancellationNoticeDays: number;
  updatedAt: string;
  updatedById: string | null;
}

export interface IUpdateSettingsInput {
  name?: string;
  timezone?: string;
  hours?: IHours;
  branches?: string[];
  freezeDaysPerYearLimit?: number;
  cancellationNoticeDays?: number;
}
