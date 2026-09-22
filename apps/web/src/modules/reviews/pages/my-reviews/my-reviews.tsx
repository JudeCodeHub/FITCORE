"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/modules/reviews/components/star-rating-input";
import { reviewsService } from "@/modules/reviews/services/reviews.service";
import type {
  IEligibleClass,
  IEligiblePtSession,
  IEligibleReviews,
  IReview,
} from "@/modules/reviews/types/review";
import { myReviewsStyles as styles } from "./my-reviews.styles";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ReviewForm({
  onSubmit,
}: {
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className={styles.rowActions}>
      <StarRatingInput value={rating} onChange={setRating} />
      <Textarea
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full sm:w-64"
        rows={2}
      />
      <Button
        size="sm"
        disabled={rating === 0 || isSubmitting}
        onClick={async () => {
          setIsSubmitting(true);
          try {
            await onSubmit(rating, comment);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {isSubmitting ? "Submitting…" : "Submit review"}
      </Button>
    </div>
  );
}

export function MyReviewsPage() {
  const [eligible, setEligible] = useState<IEligibleReviews>({
    classes: [],
    ptSessions: [],
  });
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function refresh() {
    setIsLoading(true);
    return Promise.all([
      reviewsService.getEligible().then(setEligible),
      reviewsService.getMine().then(setReviews),
    ]).finally(() => setIsLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitClassReview(
    booking: IEligibleClass,
    rating: number,
    comment: string,
  ) {
    await reviewsService.create({
      bookingId: booking.bookingId,
      rating,
      comment: comment || undefined,
    });
    await refresh();
  }

  async function submitSessionReview(
    session: IEligiblePtSession,
    rating: number,
    comment: string,
  ) {
    await reviewsService.create({
      ptSessionId: session.ptSessionId,
      rating,
      comment: comment || undefined,
    });
    await refresh();
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const hasEligible =
    eligible.classes.length > 0 || eligible.ptSessions.length > 0;

  return (
    <div>
      <h1 className={styles.title}>Reviews</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Rate your recent sessions</h2>
        <Card>
          <CardContent className="pt-6">
            {!hasEligible ? (
              <p className={styles.empty}>
                Nothing to review right now — check back after your next
                class or PT session.
              </p>
            ) : (
              <>
                {eligible.classes.map((c) => (
                  <div key={c.bookingId} className={styles.row}>
                    <div className={styles.rowMain}>
                      <div className={styles.rowTitle}>{c.className}</div>
                      <div className={styles.rowMeta}>
                        {formatDateTime(c.endTime)} · {c.trainerName}
                      </div>
                    </div>
                    <ReviewForm
                      onSubmit={(rating, comment) =>
                        submitClassReview(c, rating, comment)
                      }
                    />
                  </div>
                ))}
                {eligible.ptSessions.map((s) => (
                  <div key={s.ptSessionId} className={styles.row}>
                    <div className={styles.rowMain}>
                      <div className={styles.rowTitle}>
                        Session with {s.trainerName}
                      </div>
                      <div className={styles.rowMeta}>
                        {formatDateTime(s.endTime)}
                      </div>
                    </div>
                    <ReviewForm
                      onSubmit={(rating, comment) =>
                        submitSessionReview(s, rating, comment)
                      }
                    />
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your reviews</h2>
        <Card>
          <CardContent className="pt-6">
            {reviews.length === 0 ? (
              <p className={styles.empty}>
                You haven&apos;t submitted any reviews yet.
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>
                      {r.booking?.class.name ??
                        `Session with ${r.ptSession?.trainer.name}`}
                    </div>
                    <div className={styles.rowMeta}>
                      {formatDateTime(r.createdAt)} · {r.rating} / 5
                    </div>
                    {r.comment && (
                      <div className={styles.comment}>“{r.comment}”</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
