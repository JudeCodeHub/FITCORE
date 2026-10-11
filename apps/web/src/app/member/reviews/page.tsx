import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { MyReviewsPage } from "@/modules/reviews";

export default function Page() {
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Member / Feedback"
        title="Reviews & feedback"
        description="Rate completed classes and sessions, and revisit what you shared."
      />
      <MyReviewsPage />
    </div>
  );
}
