"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { trainerProfilesService } from "@/modules/trainer-profiles";
import { ApiError } from "@/shared/api-client/http";
import { PhotoGrid } from "../../components/photo-grid";
import { progressPhotosService } from "../../services/progress-photos.service";
import type { IProgressPhoto } from "../../types/progress-photo";
import { trainerMemberPhotosStyles as styles } from "./trainer-member-photos.styles";

export function TrainerMemberPhotosPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = params.memberId;

  const [memberName, setMemberName] = useState<string | null>(null);
  const [photos, setPhotos] = useState<IProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null);
      Promise.all([
        progressPhotosService.listForMember(memberId).then(setPhotos),
        trainerProfilesService.listMyMembers().then((members) => {
          setMemberName(members.find((m) => m.id === memberId)?.name ?? null);
        }),
      ])
        .catch((err) =>
          setError(err instanceof ApiError ? err.message : "Failed to load"),
        )
        .finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [memberId]);

  return (
    <div>
      <h1 className={styles.title}>
        {memberName ? `${memberName}'s Progress Photos` : "Progress Photos"}
      </h1>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <PhotoGrid photos={photos} />
      )}
    </div>
  );
}
