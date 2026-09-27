export function BookingMockup() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-black/5 dark:shadow-black/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading text-base font-semibold">Morning HIIT</p>
          <p className="text-xs text-muted-foreground">7:00 AM · Coach Aria</p>
        </div>
        <span className="rounded-full bg-status-active/15 px-2.5 py-1 text-xs font-semibold text-status-active">
          12/12 booked
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">
          Waitlist #1 → auto-promoted
        </span>
        <span className="text-xs font-semibold text-primary">
          Seat confirmed
        </span>
      </div>
    </div>
  );
}
