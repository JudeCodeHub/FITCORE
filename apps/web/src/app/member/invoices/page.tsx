"use client";

import { useEffect, useState, useTransition } from "react";
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

interface PaymentItem {
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
  membership?: {
    id: string;
    startDate: string;
    endDate: string;
    plan?: {
      name: string;
      duration: string;
    } | null;
  } | null;
}

interface PaymentHistoryResponse {
  data: PaymentItem[];
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

export default function MemberInvoicesPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
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
    limit: 10,
    totalPages: 1,
  });

  const [status, setStatus] = useState<string>("ALL");
  const [method, setMethod] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchPayments = async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", targetPage.toString());
      params.set("limit", "10");

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
      console.error("Failed to load payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [status, method, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments(1);
  };

  const setPresetRange = (preset: "all" | "30days" | "thisYear") => {
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "30days") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(new Date().toISOString().split("T")[0]);
    } else if (preset === "thisYear") {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    setDownloadingId(paymentId);
    try {
      await downloadReport(`/payments/${paymentId}/invoice-pdf`);
    } catch (err) {
      console.error("Failed to download PDF invoice:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const renderStatusBadge = (s: PaymentItem["status"]) => {
    switch (s) {
      case "SUCCEEDED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30">
            Succeeded
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/30">
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/20 border-destructive/30">
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20 border-purple-500/30">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{s}</Badge>;
    }
  };

  const renderMethodBadge = (m: PaymentItem["method"]) => {
    switch (m) {
      case "STRIPE":
        return (
          <span className="inline-flex items-center text-xs font-medium text-muted-foreground">
            💳 Stripe
          </span>
        );
      case "CASH":
        return (
          <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
            💵 Cash
          </span>
        );
      case "CARD_PRESENT":
        return (
          <span className="inline-flex items-center text-xs font-medium text-sky-600 dark:text-sky-400">
            🏧 Terminal POS
          </span>
        );
      default:
        return <span className="text-xs text-muted-foreground">{m}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment & Invoice History</h1>
        <p className="text-muted-foreground text-sm">
          Review your past membership payments and download official PDF tax invoices.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Amount Paid</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              ${summary.totalAmount.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Successful Invoices</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.succeededCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending / Processing</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {summary.pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Refunded Payments</CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {summary.refundedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Controls Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base font-semibold">Filter Invoices</CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
            {/* Status Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Status</Label>
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

            {/* Method Filter */}
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

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* End Date */}
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

          {/* Search bar & Reset */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-1">
            <Input
              placeholder="Search by invoice number (e.g. INV-)..."
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

      {/* Table of Invoices */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
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
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <p className="text-sm font-medium">No payments found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting or resetting your filter criteria above.
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
                  const description = p.membership?.plan?.name
                    ? `${p.membership.plan.name} Membership (${p.membership.plan.duration.toLowerCase()})`
                    : "FitCore Gym Payment";

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-medium text-foreground">
                        {invNumber}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formattedDate}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {description}
                      </TableCell>
                      <TableCell>{renderMethodBadge(p.method)}</TableCell>
                      <TableCell>{renderStatusBadge(p.status)}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        ${Number(p.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-medium gap-1"
                            disabled={downloadingId === p.id}
                            onClick={() => handleDownloadInvoice(p.id)}
                          >
                            📄 {downloadingId === p.id ? "Generating..." : "PDF"}
                          </Button>
                          {p.receiptUrl && (
                            <a
                              href={p.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Stripe Receipt
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

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
              <div>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total transactions)
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
    </div>
  );
}
