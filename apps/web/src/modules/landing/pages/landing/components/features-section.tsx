import { FeatureRow } from "./feature-row";
import { AnalyticsMockup } from "./mockups/analytics-mockup";
import { BookingMockup } from "./mockups/booking-mockup";
import { RolesMockup } from "./mockups/roles-mockup";
import { ReviewsMockup } from "./mockups/reviews-mockup";
import { featuresStyles as styles } from "./features-section.styles";

export function FeaturesSection() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>What&apos;s inside</span>
        <h2 className={styles.title}>
          Everything a gym needs to run itself
        </h2>
      </div>

      <div className={styles.rows}>
        <FeatureRow
          eyebrow="Analytics"
          title="Analytics that actually run the business"
          body="Revenue by plan, churn trend, class attendance, peak hours — exportable to CSV or PDF, not buried in a spreadsheet nobody opens."
          visual={<AnalyticsMockup />}
        />
        <FeatureRow
          eyebrow="Booking"
          title="Booking that never double-books"
          body="Concurrency-safe class booking with automatic waitlist promotion — no overbooked classes, no manual cleanup when someone cancels."
          visual={<BookingMockup />}
          reverse
        />
        <FeatureRow
          eyebrow="Roles"
          title="Every role, its own dashboard"
          body="Four purpose-built experiences from one platform — admins see the business, trainers see their schedule, members see their progress."
          visual={<RolesMockup />}
        />
        <FeatureRow
          eyebrow="Retention"
          title="Members who stick around"
          body="Post-session reviews, progress tracking, and a freeze/cancellation policy that's actually enforced — not just written down somewhere."
          visual={<ReviewsMockup />}
          reverse
        />
      </div>
    </section>
  );
}
