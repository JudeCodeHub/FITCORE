"use client";

import { WorkspacePageBanner } from "@/components/layout/workspace-page-banner";
import { WeeklyTimetable } from "@/modules/classes";
import { useAuth } from "@/shared/auth/auth-context";

export function TrainerHomePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div>
      <WorkspacePageBanner
        eyebrow="Trainer / Today"
        title={`Ready for today, ${user.name.split(" ")[0]}?`}
        description="Your class schedule and coaching day at a glance."
      />
      <WeeklyTimetable trainerId={user.id} />
    </div>
  );
}
