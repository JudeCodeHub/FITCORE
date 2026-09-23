"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { featuresStyles as styles } from "./features-section.styles";

export function FeatureRow({
  eyebrow,
  title,
  body,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={styles.row(isVisible, reverse)}>
      <div>
        <span className={styles.rowEyebrow}>{eyebrow}</span>
        <h3 className={styles.rowTitle}>{title}</h3>
        <p className={styles.rowBody}>{body}</p>
      </div>
      <div className={styles.visual}>{visual}</div>
    </div>
  );
}
