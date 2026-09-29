export function BookingMockup() {
  return (
    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-7 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-heading text-base sm:text-lg font-semibold text-white">Morning HIIT</p>
          <p className="text-xs sm:text-sm text-white/60">7:00 AM · Coach Aria · Studio A</p>
        </div>
        <span className="rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
          12/12 booked
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-primary/40 bg-primary/10 px-4 py-3.5">
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-medium text-white/80">
            Waitlist #1 → Auto-promoted
          </span>
          <span className="text-[11px] text-white/50">
            Concurrency lock resolved
          </span>
        </div>
        <span className="rounded-md bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
          Seat confirmed
        </span>
      </div>
    </div>
  );
}
