import { AdminPageBanner } from "@/components/layout/admin-page-banner";
import { PlanManagementPage } from "@/modules/plans";

export default function Page() {
  return (
    <div>
      <AdminPageBanner
        eyebrow="Membership products"
        title="Plans"
        description="Create and maintain the plans members can subscribe to."
      />
      <PlanManagementPage />
    </div>
  );
}
