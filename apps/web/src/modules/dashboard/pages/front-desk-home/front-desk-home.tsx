"use client";

import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { CheckInDeskPage } from "@/modules/check-in";
import { useAuth } from "@/shared/auth/auth-context";

export function FrontDeskHomePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Front desk / Today"
        title={`Welcome back, ${user.name.split(" ")[0]}.`}
        description="Check members in, keep an eye on who's here, and help every visit start smoothly."
      />
      <CheckInDeskPage />
    </div>
  );
}
