import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { IProgressPhoto } from "@/modules/progress-photos/types/progress-photo";
import { photoGridStyles as styles } from "./photo-grid.styles";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PhotoGrid({
  photos,
  onDelete,
}: {
  photos: IProgressPhoto[];
  onDelete?: (photo: IProgressPhoto) => void;
}) {
  if (photos.length === 0) {
    return <p className="text-sm text-muted-foreground">No photos yet.</p>;
  }

  return (
    <div className={styles.grid}>
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden pt-0">
          <div className={styles.imageWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, short-lived and external; next/image optimization doesn't apply */}
            <img
              src={photo.url}
              alt={photo.note ?? "Progress photo"}
              className={styles.image}
            />
          </div>
          <CardContent className={styles.meta}>
            {photo.note && <p className={styles.note}>{photo.note}</p>}
            <p className={styles.date}>{formatDate(photo.takenAt)}</p>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => onDelete(photo)}
              >
                Delete
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
