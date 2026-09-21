"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/shared/api-client/http";
import { useAuth } from "@/shared/auth/auth-context";
import { trainerProfilesService } from "@/modules/trainer-profiles/services/trainer-profiles.service";
import { trainerProfileEditorStyles as styles } from "./trainer-profile-editor.styles";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TrainerProfileEditorPage() {
  const { user } = useAuth();
  const [bio, setBio] = useState("");
  const [specialtiesText, setSpecialtiesText] = useState("");
  const [certificationsText, setCertificationsText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    trainerProfilesService
      .getMine()
      .then((profile) => {
        if (!profile) return;
        setBio(profile.bio ?? "");
        setSpecialtiesText(profile.specialties.join(", "));
        setCertificationsText(profile.certifications.join(", "));
        setPhotoUrl(profile.photoUrl ?? "");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await trainerProfilesService.upsertMine({
        bio: bio.trim() || undefined,
        specialties: specialtiesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: certificationsText
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        photoUrl: photoUrl.trim() || undefined,
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div>
      <h1 className={styles.title}>My Profile</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={styles.layout}>
        <Card>
          <CardContent className={styles.photoCard}>
            <Avatar className={styles.photoAvatar}>
              <AvatarImage src={photoUrl || undefined} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <p className={styles.hint}>Members see this on your profile.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <Label htmlFor="photo-url">Photo URL</Label>
                <Input
                  id="photo-url"
                  type="url"
                  placeholder="https://…"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={5}
                  maxLength={2000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell members about your training background…"
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                  placeholder="Powerlifting, Mobility, HIIT"
                />
                <p className={styles.hint}>Comma-separated.</p>
              </div>

              <div className={styles.field}>
                <Label htmlFor="certifications">Certifications</Label>
                <Input
                  id="certifications"
                  value={certificationsText}
                  onChange={(e) => setCertificationsText(e.target.value)}
                  placeholder="NASM-CPT, CSCS"
                />
                <p className={styles.hint}>Comma-separated.</p>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
                {justSaved && <span className={styles.savedNote}>Saved</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
