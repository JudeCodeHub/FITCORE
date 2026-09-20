import { WeeklyTimetable } from "@/modules/classes/components/weekly-timetable";

export function TimetablePage({ interactive = false }: { interactive?: boolean }) {
  return <WeeklyTimetable interactive={interactive} />;
}
