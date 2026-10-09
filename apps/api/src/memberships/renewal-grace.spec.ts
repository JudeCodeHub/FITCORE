import { describe, expect, it } from 'vitest';
import { isPastRenewalGrace } from './renewal-grace.js';

describe('renewal grace', () => {
  const end = new Date('2026-01-01T00:00:00Z');
  it('distinguishes an open grace window from its exact expiry', () => {
    expect(isPastRenewalGrace(end, 3, new Date('2026-01-03T23:59:59Z'))).toBe(false);
    expect(isPastRenewalGrace(end, 3, new Date('2026-01-04T00:00:00Z'))).toBe(true);
  });
});
