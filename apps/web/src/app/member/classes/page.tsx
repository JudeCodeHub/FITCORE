import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { TimetablePage } from "@/modules/classes";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Member / Classes"
        title="Find your next class"
        description="Browse this week’s schedule and reserve a spot in a class you love."
      />
      <TimetablePage interactive />
    </div>
  );
}
