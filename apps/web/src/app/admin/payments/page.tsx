"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/api-client/http";
import { downloadReport } from "@/shared/api-client/download";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminPaymentItem {
  id: string;
  invoiceNumber: string | null;
  amount: string | number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  method: "STRIPE" | "CASH" | "CARD_PRESENT";
  receiptUrl?: string | null;
  failureReason?: string | null;
  refundAmount?: string | number | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  membership?: {
    id: string;
    plan?: {
      name: string;
      duration: string;
    } | null;
  } | null;
}

interface PaymentHistoryResponse {
  data: AdminPaymentItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    succeededCount: number;
    failedCount: number;
    refundedCount: number;
    pendingCount: number;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    succeededCount: 0,
    failedCount: 0,
    refundedCount: 0,
    pendingCount: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });

  const [status, setStatus] = useState<string>("ALL");
  const [method, setMethod] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] =
    useState<AdminPaymentItem | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState<string>("");
  const [isFullRefund, setIsFullRefund] = useState<boolean>(true);
  const [refundLoading, setRefundLoading] = useState<boolean>(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const openRefundModal = (payment: AdminPaymentItem) => {
    const remaining = Number(payment.amount) - Number(payment.refundAmount || 0);
    setSelectedPaymentForRefund(payment);
    setIsFullRefund(true);
    setRefundAmount(remaining.toFixed(2));
    setRefundReason("");
    setRefundError(null);
  };

  const handleProcessRefund = async () => {
    if (!selectedPaymentForRefund) return;
    const numAmount = parseFloat(refundAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setRefundError("Please enter a valid refund amount.");
      return;
    }

    setRefundLoading(true);
    setRefundError(null);
    try {
      await apiFetch(`/payments/${selectedPaymentForRefund.id}/refund`, {
        method: "POST",
        body: JSON.stringify({
          amount: numAmount,
          reason: refundReason.trim() || undefined,
        }),
      });
      setSelectedPaymentForRefund(null);
      await fetchPayments(pagination.page);
    } catch (err: unknown) {
      setRefundError(err instanceof Error ? err.message : "Failed to process refund");
    } finally {
      setRefundLoading(false);
    }
  };

  const fetchPayments = async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", targetPage.toString());
      params.set("limit", "15");

      if (status !== "ALL") params.set("status", status);
      if (method !== "ALL") params.set("method", method);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (search.trim()) params.set("search", search.trim());

      const res = await apiFetch<PaymentHistoryResponse>(
        `/payments?${params.toString()}`,
      );
      setPayments(res.data);
      setSummary(res.summary);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load admin payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [status, method, startDate, endDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments(1);
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    setDownloadingId(paymentId);
    try {
      await downloadReport(`/payments/${paymentId}/invoice-pdf`);
    } catch (err) {
      console.error("Failed to download invoice PDF:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const setPresetRange = (preset: "all" | "today" | "30days" | "thisYear") => {
    const today = new Date().toISOString().split("T")[0];
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "30days") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(today);
    } else if (preset === "thisYear") {
      const start = new Date(new Date().getFullYear(), 0, 1);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(today);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Revenue Log</h1>
          <p className="text-muted-foreground text-sm">
            Monitor gym transactions, billing lifecycles, and export PDF receipts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Collected Revenue</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${summary.totalAmount.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Successful Transactions</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {summary.succeededCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Failed Charges</CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive">
              {summary.failedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Refunded Payments</CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {summary.refundedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base font-semibold">Filter Payments</CardTitle>
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-muted-foreground mr-1">Presets:</span>
              <Button
                variant={!startDate && !endDate ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPresetRange("all")}
              >
                All Time
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPresetRange("today")}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPresetRange("30days")}
              >
                Last 30 Days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPresetRange("thisYear")}
              >
                This Year
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <select
                aria-label="Filter by Payment Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCEEDED">Succeeded</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Payment Method</Label>
              <select
                aria-label="Filter by Payment Method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ALL">All Methods</option>
                <option value="STRIPE">Stripe (Online)</option>
                <option value="CASH">Cash (Front Desk)</option>
                <option value="CARD_PRESENT">Card (In-Person)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search member name, email, or invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-9">
              Search
            </Button>
            {(status !== "ALL" ||
              method !== "ALL" ||
              startDate ||
              endDate ||
              search) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={() => {
                  setStatus("ALL");
                  setMethod("ALL");
                  setStartDate("");
                  setEndDate("");
                  setSearch("");
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <p className="text-sm font-medium">No transactions found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting the date range or status filters.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => {
                  const invNumber = p.invoiceNumber || `INV-${p.id.slice(-8).toUpperCase()}`;
                  const formattedDate = new Date(p.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{p.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{p.user?.email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{invNumber}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formattedDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {p.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            p.status === "SUCCEEDED"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : p.status === "FAILED"
                              ? "bg-destructive/15 text-destructive"
                              : p.status === "REFUNDED"
                              ? "bg-purple-500/15 text-purple-700 dark:text-purple-400"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-semibold text-sm">
                          ${Number(p.amount).toFixed(2)}
                        </div>
                        {p.refundAmount && Number(p.refundAmount) > 0 && (
                          <div className="text-[11px] text-purple-600 dark:text-purple-400">
                            -${Number(p.refundAmount).toFixed(2)} refunded
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === "SUCCEEDED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => openRefundModal(p)}
                            >
                              Refund
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            disabled={downloadingId === p.id}
                            onClick={() => handleDownloadInvoice(p.id)}
                          >
                            📄 {downloadingId === p.id ? "PDF..." : "PDF"}
                          </Button>
                          {p.receiptUrl && (
                            <a
                              href={p.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Stripe
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
              <div>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total payments)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchPayments(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchPayments(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Modal Dialog */}
      {selectedPaymentForRefund && (
        <Dialog
          open={true}
          onOpenChange={(open) => !open && setSelectedPaymentForRefund(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Issue Payment Refund</DialogTitle>
              <DialogDescription>
                Process a full or partial refund for {selectedPaymentForRefund.user.name} ({selectedPaymentForRefund.user.email}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {refundError && (
                <div className="rounded-md bg-destructive/15 p-2.5 text-xs text-destructive font-medium">
                  {refundError}
                </div>
              )}

              {(() => {
                const total = Number(selectedPaymentForRefund.amount);
                const prevRefund = Number(selectedPaymentForRefund.refundAmount || 0);
                const maxRefundable = Math.max(0, total - prevRefund);

                return (
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/40 p-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Invoice:</span>
                        <span className="font-mono font-medium">
                          {selectedPaymentForRefund.invoiceNumber || selectedPaymentForRefund.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Total:</span>
                        <span className="font-medium">${total.toFixed(2)}</span>
                      </div>
                      {prevRefund > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Already Refunded:</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">
                            -${prevRefund.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t font-semibold">
                        <span>Max Refundable:</span>
                        <span className="text-primary">${maxRefundable.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Refund Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={isFullRefund ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setIsFullRefund(true);
                            setRefundAmount(maxRefundable.toFixed(2));
                          }}
                        >
                          Full (${maxRefundable.toFixed(2)})
                        </Button>
                        <Button
                          type="button"
                          variant={!isFullRefund ? "default" : "outline"}
                          size="sm"
                          onClick={() => setIsFullRefund(false)}
                        >
                          Partial
                        </Button>
                      </div>
                    </div>

                    {!isFullRefund && (
                      <div className="space-y-1.5">
                        <Label className="text-xs" htmlFor="refund-amount">
                          Partial Refund Amount ($)
                        </Label>
                        <Input
                          id="refund-amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={maxRefundable}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs" htmlFor="refund-reason">
                        Reason (Optional)
                      </Label>
                      <Input
                        id="refund-reason"
                        placeholder="e.g. Cancelled within cooling period, billing error"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={refundLoading}
                onClick={() => setSelectedPaymentForRefund(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={refundLoading}
                onClick={handleProcessRefund}
              >
                {refundLoading
                  ? "Processing..."
                  : `Confirm Refund ($${Number(refundAmount || 0).toFixed(2)})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
