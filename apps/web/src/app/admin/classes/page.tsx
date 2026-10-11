import { AdminPageBanner } from "@/components/layout/admin-page-banner";
import { TimetablePage } from "@/modules/classes";

export default function Page() {
  return (
    <div>
      <AdminPageBanner
        eyebrow="Daily operations"
        title="Classes & schedule"
        description="View the weekly timetable and keep every class on track."
      />
      <TimetablePage />
    </div>
  );
}
