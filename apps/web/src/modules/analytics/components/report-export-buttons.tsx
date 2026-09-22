"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ReportExportFormat } from "@/modules/analytics/services/analytics.service";

export function ReportExportButtons({
  onExport,
}: {
  onExport: (format: ReportExportFormat) => Promise<void>;
}) {
  const [pending, setPending] = useState<ReportExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(format: ReportExportFormat) {
    setPending(format);
    setError(null);
    try {
      await onExport(format);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending !== null}
        onClick={() => handleExport("csv")}
      >
        {pending === "csv" ? "Exporting…" : "Export CSV"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending !== null}
        onClick={() => handleExport("pdf")}
      >
        {pending === "pdf" ? "Exporting…" : "Export PDF"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
