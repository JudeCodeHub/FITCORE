import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  sendVerificationEmail(to: string, token: string) {
    const link = `http://localhost:3000/verify-email?token=${token}`;
    this.logger.log(
      `[stub email] Verify your FitCore account, ${to}: ${link}`,
    );
  }

  sendPasswordResetEmail(to: string, token: string) {
    const link = `http://localhost:3000/reset-password?token=${token}`;
    this.logger.log(`[stub email] Reset your FitCore password, ${to}: ${link}`);
  }

  sendStaffInviteEmail(to: string, token: string, role: string) {
    const link = `http://localhost:3000/staff-onboarding?token=${token}`;
    this.logger.log(
      `[stub email] You've been invited to join FitCore as ${role}, ${to}: ${link}`,
    );
  }

  sendBookingConfirmationEmail(
    to: string,
    className: string,
    startTime: Date,
  ) {
    this.logger.log(
      `[stub email] Booking confirmed for ${to}: ${className} at ${startTime.toISOString()}`,
    );
  }

  sendWaitlistedEmail(to: string, className: string, position: number) {
    this.logger.log(
      `[stub email] Waitlisted for ${to}: ${className}, position #${position}`,
    );
  }

  sendPtSessionConfirmationEmail(
    to: string,
    otherPartyName: string,
    startTime: Date,
  ) {
    this.logger.log(
      `[stub email] PT session confirmed for ${to}, with ${otherPartyName} at ${startTime.toISOString()}`,
    );
  }

  sendRenewalReminderEmail(to: string, planName: string, endDate: Date) {
    this.logger.log(
      `[stub email] Membership renewal reminder for ${to}: ${planName} expires ${endDate.toISOString()}`,
    );
  }

  sendPaymentFailedDunningEmail(
    to: string,
    amount: string,
    attemptCount: number,
    nextRetryDate: Date | null,
    invoiceUrl?: string | null,
  ) {
    const nextRetryText = nextRetryDate
      ? `Next automatic retry scheduled for ${nextRetryDate.toLocaleDateString()}.`
      : 'All automatic retries have been exhausted.';
    this.logger.log(
      `[stub email] Payment failed alert for ${to}: Attempt #${attemptCount} for $${amount} failed. ${nextRetryText} Please update your payment method: ${invoiceUrl || 'http://localhost:3000/member'}`,
    );
  }

  sendMembershipSuspendedEmail(to: string, planName?: string) {
    this.logger.log(
      `[stub email] Membership suspended for ${to}: Payment retries failed. Your ${planName || 'FitCore'} membership has been suspended until payment is resolved.`,
    );
  }

  sendCashPaymentReceiptEmail(to: string, amount: string, invoiceNumber: string) {
    this.logger.log(
      `[stub email] Cash payment receipt for ${to}: $${amount} received at front desk. Invoice #${invoiceNumber}.`,
    );
  }

  sendRefundConfirmationEmail(
    to: string,
    amount: string,
    invoiceNumber: string,
    isFullRefund: boolean,
    reason?: string,
  ) {
    const typeStr = isFullRefund ? 'Full refund' : 'Partial refund';
    const reasonText = reason ? ` Reason: ${reason}.` : '';
    this.logger.log(
      `[stub email] ${typeStr} processed for ${to}: $${amount} has been refunded for Invoice #${invoiceNumber}.${reasonText}`,
    );
  }
}
