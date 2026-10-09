export function isPastRenewalGrace(endDate: Date, graceDays: number, now = new Date()): boolean {
  return endDate.getTime() + graceDays * 86_400_000 <= now.getTime();
}
