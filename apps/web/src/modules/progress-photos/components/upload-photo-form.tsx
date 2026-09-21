"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/shared/api-client/http";
import { progressPhotosService } from "@/modules/progress-photos/services/progress-photos.service";
import { uploadPhotoFormStyles as styles } from "./upload-photo-form.styles";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function UploadPhotoForm({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Choose a photo first.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, or WebP images are supported.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { uploadUrl, key } = await progressPhotosService.requestUploadUrl(
        file.type,
      );
      await progressPhotosService.uploadToStorage(uploadUrl, file);
      await progressPhotosService.create({ key, note: note || undefined });
      setFile(null);
      setNote("");
      onUploaded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <Label htmlFor="photo-file">Photo</Label>
        <Input
          id="photo-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor="photo-note">Note</Label>
        <Input
          id="photo-note"
          placeholder="e.g. Week 4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.submitRow}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </form>
  );
}
