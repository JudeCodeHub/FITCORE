"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/api-client/http";
import { downloadReport } from "@/shared/api-client/download";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  name: string;
  email: string;
  memberships?: Array<{
    id: string;
    status: string;
    plan?: { name: string; duration: string };
  }>;
}

interface Plan {
  id: string;
  name: string;
  price: string | number;
  duration: string;
  isActive: boolean;
}

interface PaymentReceipt {
  success: boolean;
  invoiceNumber: string;
  payment: {
    id: string;
    amount: string;
    method: string;
    createdAt: string;
    user: { name: string; email: string };
    membership?: { plan?: { name: string } };
  };
}

export default function WalkInSalesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<"CASH" | "CARD_PRESENT">("CASH");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  // Load plans on mount
  useEffect(() => {
    apiFetch<Plan[]>("/plans")
      .then((data) => setPlans(data.filter((p) => p.isActive)))
      .catch((err) => console.error("Failed to load plans:", err));
  }, []);

  // Search members when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      apiFetch<Member[]>(`/payments/members${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`)
        .then((data) => setMembers(data))
        .catch((err) => console.error("Failed to search members:", err));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setAmount(Number(plan.price).toFixed(2));
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setError("Please select a member first.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<PaymentReceipt>("/payments/walk-in", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedMember.id,
          planId: selectedPlanId || undefined,
          amount: numAmount,
          method,
          notes: notes.trim() || undefined,
        }),
      });

      setReceipt(res);
      // Reset form
      setNotes("");
    } catch (err: any) {
      setError(err?.message || "Failed to record walk-in payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Front Desk Walk-In Sale</h1>
        <p className="text-muted-foreground text-sm">
          Collect cash or in-person card payments and immediately activate membership access.
        </p>
      </div>

      {receipt && (
        <Card className="border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Payment Succeeded</Badge>
              <span className="text-xs text-muted-foreground font-mono">{receipt.invoiceNumber}</span>
            </div>
            <CardTitle className="text-emerald-700 dark:text-emerald-300">
              ${receipt.payment.amount} Collected
            </CardTitle>
            <CardDescription>
              Receipt recorded for {receipt.payment.user.name} ({receipt.payment.user.email}) via{" "}
              {receipt.payment.method}. Membership is active.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReceipt(null);
                setSelectedMember(null);
                setSelectedPlanId("");
                setAmount("");
              }}
            >
              Start New Sale
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => downloadReport(`/payments/${receipt.payment.id}/invoice-pdf`)}
            >
              📄 Download Invoice PDF
            </Button>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleRecordPayment} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        {/* 1. Member Lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Select Walk-In Member</CardTitle>
            <CardDescription>Search by name or email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Search member name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {selectedMember ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div>
                  <p className="font-semibold text-sm">{selectedMember.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedMember.email}</p>
                  {selectedMember.memberships?.[0] && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Current: {selectedMember.memberships[0].plan?.name ?? "Custom"} (
                      {selectedMember.memberships[0].status})
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-border rounded-md border">
                {members.length === 0 ? (
                  <p className="p-3 text-xs text-muted-foreground">No members found</p>
                ) : (
                  members.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="flex cursor-pointer items-center justify-between p-2.5 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <span className="font-medium">{m.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{m.email}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Select
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Plan & Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Plan & Payment Details</CardTitle>
            <CardDescription>Select a membership package or specify a custom payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Membership Plan</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlan(p.id)}
                      className={`cursor-pointer rounded-lg border p-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.duration.toLowerCase()}</p>
                      <p className="mt-2 text-base font-bold text-primary">${p.price}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($ USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={method === "CASH" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setMethod("CASH")}
                  >
                    💵 Cash
                  </Button>
                  <Button
                    type="button"
                    variant={method === "CARD_PRESENT" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setMethod("CARD_PRESENT")}
                  >
                    💳 Card (In-Person)
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Receipt Reference (Optional)</Label>
              <Input
                id="notes"
                placeholder="e.g. Register drawer #2, receipt handed to member"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading || !selectedMember || !amount}>
            {loading ? "Recording Payment..." : "Record Payment & Activate"}
          </Button>
        </div>
      </form>
    </div>
  );
}
