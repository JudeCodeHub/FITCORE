"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function MyQrCode({ qrCodeId }: { qrCodeId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">My Check-In Code</CardTitle>
        <CardDescription>
          Show this at the front desk to check in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <div className="rounded-lg border bg-white p-4">
          <QRCodeSVG value={qrCodeId} size={160} level="M" />
        </div>
        <p className="font-mono text-xs tracking-wider text-muted-foreground">
          {qrCodeId}
        </p>
      </CardContent>
    </Card>
  );
}
