import Link from "next/link";
import { landingFooterStyles as styles } from "./landing-footer.styles";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.wordmark}>FitCore</p>
          <p className={styles.tagline}>Gym management, run on real numbers.</p>
        </div>

        <nav className={styles.links}>
          <Link href="/login" className={styles.link}>
            Login
          </Link>
          <Link href="/signup" className={styles.link}>
            Sign Up
          </Link>
        </nav>
      </div>

      <div className={styles.copyrightWrap}>
        <p className={styles.copyright}>
          &copy; {year} FitCore. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
