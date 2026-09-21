"use client";

import { CheckInDeskPage } from "@/modules/check-in";
import { useAuth } from "@/shared/auth/auth-context";

export function FrontDeskHomePage() {
  const { user } = useAuth();
  if (!user) return null;
  return <CheckInDeskPage />;
}
