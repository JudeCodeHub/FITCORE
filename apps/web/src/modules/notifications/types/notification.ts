export type NotificationType =
  | "BOOKING_CONFIRMATION"
  | "CLASS_REMINDER"
  | "MEMBERSHIP_RENEWAL"
  | "PAYMENT_ALERT"
  | "PT_SESSION_CONFIRMATION"
  | "MAINTENANCE_UPDATE"
  | "GENERAL";

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface ICreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}
