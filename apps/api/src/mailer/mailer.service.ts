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
}
