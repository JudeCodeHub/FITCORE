import { XIcon } from "lucide-react";
import { cn } from "cn";
import type { IAvailabilityWindow } from "@/modules/trainer-availability/types/trainer-availability";
import { availabilityScheduleStyles as styles } from "../availability-schedule.styles";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const GRID_START_MINUTE = 5 * 60;
const GRID_END_MINUTE = 23 * 60;
const GRID_SPAN_MINUTES = GRID_END_MINUTE - GRID_START_MINUTE;
const HOURS = Array.from(
  { length: (GRID_END_MINUTE - GRID_START_MINUTE) / 60 },
  (_, i) => GRID_START_MINUTE / 60 + i,
);

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${period}`;
}

export function formatMinuteLabel(minute: number): string {
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  const period = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${min === 0 ? "" : `:${String(min).padStart(2, "0")}`} ${period}`;
}

export function WeeklyGrid({
  windows,
  onRemove,
}: {
  windows: IAvailabilityWindow[];
  onRemove: (id: string) => void;
}) {
  const today = new Date().getDay();

  return (
    <div className={styles.gridScroll}>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: "56px repeat(7, minmax(80px, 1fr))" }}
      >
        <div className={styles.cornerCell} />
        {DAY_ORDER.map((dayOfWeek, i) => (
          <div
            key={dayOfWeek}
            className={cn(
              styles.dayHeader,
              dayOfWeek === today && styles.dayHeaderToday,
            )}
          >
            {DAY_LABELS[i]}
          </div>
        ))}

        <div
          className={cn("relative", styles.hourLabelColumn)}
          style={{ height: HOURS.length * 40 }}
        >
          {HOURS.map((hour) => (
            <div
              key={hour}
              className={styles.hourLabel}
              style={{ position: "absolute", top: (hour - HOURS[0]) * 40, right: 0, left: 0 }}
            >
              {formatHourLabel(hour)}
            </div>
          ))}
        </div>

        {DAY_ORDER.map((dayOfWeek) => (
          <div
            key={dayOfWeek}
            className={cn(
              "relative",
              dayOfWeek === today && styles.cellToday,
            )}
            style={{ height: HOURS.length * 40 }}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className={cn(styles.cell)}
                style={{ position: "absolute", top: (hour - HOURS[0]) * 40, height: 40, width: "100%" }}
              />
            ))}

            {windows
              .filter((w) => w.dayOfWeek === dayOfWeek)
              .map((w) => {
                const top =
                  ((w.startMinute - GRID_START_MINUTE) / GRID_SPAN_MINUTES) *
                  HOURS.length *
                  40;
                const height =
                  ((w.endMinute - w.startMinute) / GRID_SPAN_MINUTES) *
                  HOURS.length *
                  40;
                return (
                  <div
                    key={w.id}
                    className={styles.block}
                    style={{ top, height: Math.max(height, 18) }}
                    title={`${formatMinuteLabel(w.startMinute)} – ${formatMinuteLabel(w.endMinute)}`}
                  >
                    <span className="truncate px-1">
                      {formatMinuteLabel(w.startMinute)}–
                      {formatMinuteLabel(w.endMinute)}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove availability window"
                      className={styles.blockRemove}
                      onClick={() => onRemove(w.id)}
                    >
                      <XIcon className="size-2.5" />
                    </button>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
