"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  WEEKDAYS,
  type IHours,
} from "@/modules/settings/types/settings";
import { hoursEditorStyles as styles } from "./hours-editor.styles";

const DAY_LABELS: Record<(typeof WEEKDAYS)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function HoursEditor({
  hours,
  onChange,
}: {
  hours: IHours;
  onChange: (next: IHours) => void;
}) {
  function setDay(
    day: (typeof WEEKDAYS)[number],
    open: string | null,
    close: string | null,
  ) {
    onChange({ ...hours, [day]: { open, close } });
  }

  return (
    <div>
      {WEEKDAYS.map((day) => {
        const isOpen = hours[day].open !== null;
        return (
          <div key={day} className={styles.row}>
            <span className={styles.dayLabel}>{DAY_LABELS[day]}</span>
            <div className={styles.switchRow}>
              <Switch
                checked={isOpen}
                onCheckedChange={(checked) =>
                  setDay(day, checked ? "06:00" : null, checked ? "22:00" : null)
                }
                id={`${day}-open`}
              />
              <Label htmlFor={`${day}-open`}>Open</Label>
            </div>
            {isOpen ? (
              <div className={styles.timeRow}>
                <Input
                  type="time"
                  className={styles.timeInput}
                  value={hours[day].open ?? ""}
                  onChange={(e) =>
                    setDay(day, e.target.value, hours[day].close)
                  }
                />
                <span>–</span>
                <Input
                  type="time"
                  className={styles.timeInput}
                  value={hours[day].close ?? ""}
                  onChange={(e) =>
                    setDay(day, hours[day].open, e.target.value)
                  }
                />
              </div>
            ) : (
              <span className={styles.closedNote}>Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
