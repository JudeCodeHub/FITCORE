"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { progressPhotosService } from "@/modules/progress-photos/services/progress-photos.service";
import type { IProgressPhoto } from "@/modules/progress-photos/types/progress-photo";
import { PhotoGrid } from "./photo-grid";
import { progressPhotosSectionStyles as styles } from "./progress-photos-section.styles";
import { UploadPhotoForm } from "./upload-photo-form";

export function ProgressPhotosSection() {
  const [photos, setPhotos] = useState<IProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    return progressPhotosService.listMine().then(setPhotos);
  }

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(photo: IProgressPhoto) {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    await progressPhotosService.remove(photo.id);
    await refresh();
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Progress Photos</h2>

      <Card className={styles.uploadCard}>
        <CardContent className="pt-6">
          <UploadPhotoForm onUploaded={refresh} />
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <PhotoGrid photos={photos} onDelete={handleDelete} />
      )}
    </div>
  );
}
