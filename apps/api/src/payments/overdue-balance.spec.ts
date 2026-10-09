import { describe, expect, it } from 'vitest';
import { overdueBalancesByUser } from './overdue-balance.js';

describe('overdue invoice balances', () => {
  it('counts retry failures once and clears a paid invoice', () => {
    const payment = (invoice: string, status: 'FAILED' | 'SUCCEEDED', amount = '49.00') => ({
      userId: 'member-1', stripeInvoiceId: invoice, status, amount, currency: 'usd',
    });
    const balances = overdueBalancesByUser([
      payment('invoice-a', 'FAILED'),
      payment('invoice-a', 'FAILED'),
      payment('invoice-b', 'FAILED', '25.00'),
      payment('invoice-a', 'SUCCEEDED'),
    ]);
    expect(balances.get('member-1')).toEqual([{ currency: 'USD', amount: '25.00' }]);
    expect(overdueBalancesByUser([payment('invoice-a', 'FAILED'), payment('invoice-a', 'SUCCEEDED')]).get('member-1')).toBeUndefined();
  });
});
