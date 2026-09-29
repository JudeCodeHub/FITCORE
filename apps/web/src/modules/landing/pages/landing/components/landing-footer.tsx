import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { landingFooterStyles as styles } from "./landing-footer.styles";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topGrid}>
          {/* Left Column: Brand, Headline, Caption */}
          <div className={styles.brandCol}>
            <div>
              <div className={styles.brandHeader}>
                <div className={styles.logoBadge}>F</div>
                <span className={styles.wordmark}>FitCore</span>
              </div>

              <h3 className={styles.headline}>
                Transform your body,
                <br />
                elevate your life
              </h3>
            </div>

            <p className={styles.caption}>
              Premium fitness management since 2024
            </p>
          </div>

          {/* Right Column: Bordered 3-Column Grid */}
          <div className={styles.boxWrapper}>
            <div className={styles.gridBox}>
              {/* Column 1: Programs */}
              <div className={styles.column}>
                <p className={styles.columnTitle}>Programs</p>
                <div className={styles.linkList}>
                  <Link href="#features" className={styles.link}>
                    Personal Training
                  </Link>
                  <Link href="#features" className={styles.link}>
                    Nutrition Coaching
                  </Link>
                  <Link href="#features" className={styles.link}>
                    Group Classes
                  </Link>
                  <Link href="#pricing" className={styles.link}>
                    Online Membership
                  </Link>
                </div>
              </div>

              {/* Column 2: Resources */}
              <div className={styles.column}>
                <p className={styles.columnTitle}>Resources</p>
                <div className={styles.linkList}>
                  <Link href="#ecosystem" className={styles.link}>
                    About Us
                  </Link>
                  <Link href="#features" className={styles.link}>
                    Blog
                  </Link>
                  <Link href="#features" className={styles.link}>
                    <span>Success Stories</span>
                    <ArrowUpRight className={styles.arrowIcon} />
                  </Link>
                  <Link href="#ecosystem" className={styles.link}>
                    <span>API Docs</span>
                    <ArrowUpRight className={styles.arrowIcon} />
                  </Link>
                </div>
              </div>

              {/* Column 3: Support */}
              <div className={styles.column}>
                <p className={styles.columnTitle}>Support</p>
                <div className={styles.linkList}>
                  <Link href="mailto:support@fitcore.com" className={styles.link}>
                    Contact
                  </Link>
                  <Link href="/login" className={styles.link}>
                    <span>Member Portal</span>
                    <ArrowUpRight className={styles.arrowIcon} />
                  </Link>
                  <Link href="#pricing" className={styles.link}>
                    FAQ
                  </Link>
                  <Link href="/signup" className={styles.link}>
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className={styles.bottomRow}>
          <p>&copy; {year} FitCore. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#pricing" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#pricing" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Massive Watermark Typography across footer bottom */}
      <div className={styles.watermarkWrapper} aria-hidden="true">
        <p className={styles.watermarkText}>FITCORE</p>
      </div>
    </footer>
  );
}
