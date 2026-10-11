import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { MyBookingsPage } from "@/modules/bookings";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Member / Bookings"
        title="Your bookings"
        description="See your upcoming classes and personal training sessions."
      />
      <MyBookingsPage />
    </div>
  );
}
