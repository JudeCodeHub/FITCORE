import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { AvailabilitySchedulePage } from "@/modules/trainer-availability";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Trainer / Schedule"
        title="Your availability"
        description="Set the hours members can book and see your week at a glance."
      />
      <AvailabilitySchedulePage />
    </div>
  );
}
