import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly origin = process.env.WEB_ORIGIN || 'http://localhost:3000';
  private readonly from = process.env.MAIL_FROM || 'FitCore <fitcore@localhost>';
  private readonly transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || '127.0.0.1',
    port: Number(process.env.SMTP_PORT || 1025),
    secure: false,
  });

  private async send(to: string, subject: string, text: string) {
    try {
      await this.transport.sendMail({ from: this.from, to, subject, text });
    } catch (error) {
      this.logger.error(`Email delivery failed for ${to}: ${String(error)}`);
      throw error;
    }
  }

  sendVerificationEmail(to: string, token: string) {
    return this.send(to, 'Verify your FitCore account', `Verify your account: ${this.origin}/verify-email?token=${encodeURIComponent(token)}`);
  }

  sendPasswordResetEmail(to: string, token: string) {
    return this.send(to, 'Reset your FitCore password', `Reset your password: ${this.origin}/reset-password?token=${encodeURIComponent(token)}`);
  }

  sendStaffInviteEmail(to: string, token: string, role: string) {
    return this.send(to, 'FitCore staff invitation', `You have been invited as ${role}: ${this.origin}/staff-onboarding?token=${encodeURIComponent(token)}`);
  }

  sendBookingConfirmationEmail(to: string, className: string, startTime: Date) {
    return this.send(to, 'Booking confirmed', `${className} at ${startTime.toISOString()}`);
  }

  sendClassReminderEmail(to: string, className: string, startTime: Date) {
    return this.send(to, 'Class reminder', `${className} starts at ${startTime.toISOString()}`);
  }

  sendWaitlistedEmail(to: string, className: string, position: number) {
    return this.send(to, 'FitCore waitlist', `${className}: position #${position}`);
  }

  sendPtSessionConfirmationEmail(to: string, otherPartyName: string, startTime: Date) {
    return this.send(to, 'PT session confirmed', `Session with ${otherPartyName} at ${startTime.toISOString()}`);
  }

  sendRenewalReminderEmail(to: string, planName: string, endDate: Date) {
    return this.send(to, 'Membership renewal reminder', `${planName} expires ${endDate.toISOString()}`);
  }

  sendPaymentFailedDunningEmail(to: string, amount: string, attemptCount: number, nextRetryDate: Date | null, invoiceUrl?: string | null) {
    const nextRetryText = nextRetryDate ? `Next retry: ${nextRetryDate.toISOString()}.` : 'Automatic retries are exhausted.';
    return this.send(to, 'Payment failed', `Attempt #${attemptCount} for $${amount} failed. ${nextRetryText} Update payment: ${invoiceUrl || `${this.origin}/member`}`);
  }

  sendMembershipSuspendedEmail(to: string, planName?: string) {
    return this.send(to, 'Membership suspended', `Payment retries failed. Your ${planName || 'FitCore'} membership is suspended until payment is resolved.`);
  }

  sendCashPaymentReceiptEmail(to: string, amount: string, invoiceNumber: string) {
    return this.send(to, 'Payment receipt', `$${amount} received at front desk. Invoice #${invoiceNumber}.`);
  }

  sendRefundConfirmationEmail(to: string, amount: string, invoiceNumber: string, isFullRefund: boolean, reason?: string) {
    return this.send(to, 'Refund processed', `${isFullRefund ? 'Full' : 'Partial'} refund: $${amount} for invoice #${invoiceNumber}.${reason ? ` Reason: ${reason}.` : ''}`);
  }
}
