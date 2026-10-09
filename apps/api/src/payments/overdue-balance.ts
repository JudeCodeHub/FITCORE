/** Derive unpaid invoice balances from payment history; retry failures share an invoice. */
export type InvoicePayment = {
  userId: string;
  stripeInvoiceId: string | null;
  status: string;
  amount: { toString(): string };
  currency: string;
};

export type OverdueBalance = { currency: string; amount: string };

export function overdueBalancesByUser(payments: InvoicePayment[]) {
  const invoices = new Map<string, { userId: string; currency: string; cents: number; paid: boolean }>();
  for (const payment of payments) {
    if (!payment.stripeInvoiceId || !['FAILED', 'SUCCEEDED'].includes(payment.status)) continue;
    const key = `${payment.userId}:${payment.stripeInvoiceId}`;
    const cents = Math.round(Number(payment.amount.toString()) * 100);
    const previous = invoices.get(key);
    invoices.set(key, {
      userId: payment.userId,
      currency: payment.currency.toUpperCase(),
      cents: Math.max(previous?.cents ?? 0, cents),
      paid: (previous?.paid ?? false) || payment.status === 'SUCCEEDED',
    });
  }
  const totals = new Map<string, Map<string, number>>();
  for (const invoice of invoices.values()) {
    if (invoice.paid || invoice.cents <= 0) continue;
    const currencies = totals.get(invoice.userId) ?? new Map<string, number>();
    currencies.set(invoice.currency, (currencies.get(invoice.currency) ?? 0) + invoice.cents);
    totals.set(invoice.userId, currencies);
  }
  return new Map([...totals].map(([userId, currencies]) => [
    userId,
    [...currencies].map(([currency, cents]): OverdueBalance => ({
      currency, amount: (cents / 100).toFixed(2),
    })),
  ]));
}
