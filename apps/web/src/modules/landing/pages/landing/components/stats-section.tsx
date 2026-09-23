import type { IStatItem } from "@/modules/landing/types/landing";
import { statsStyles as styles } from "./stats-section.styles";

const STATS: IStatItem[] = [
  { value: "4", label: "Role-based dashboards" },
  { value: "12+", label: "Feature modules" },
  { value: "0", label: "Overbooked seats — concurrency-tested" },
  { value: "4", label: "Exportable analytics reports" },
];

export function StatsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.item}>
            <p className={styles.value}>{stat.value}</p>
            <p className={styles.label}>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
