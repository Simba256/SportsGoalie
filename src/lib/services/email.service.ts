/**
 * Email Service
 *
 * Handles sending emails for various purposes (invitations, notifications, verifications, etc.)
 * Development mode: Logs to console
 * Production mode: Sends via Resend with branded templates
 */

import { Resend } from 'resend';
import { CoachInvitation } from '@/types/auth';
import { logInfo, logError, logDebug } from '@/lib/errors/error-logger';

// Initialize Resend client (only in production when API key is available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Email template data for coach invitations
 */
interface CoachInvitationEmailData {
  invitation: CoachInvitation;
  inviteUrl: string;
  appName?: string;
  supportEmail?: string;
}

/**
 * Generic email data
 */
interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Verification email data
 */
interface VerificationEmailData {
  to: string;
  displayName: string;
  verificationLink: string;
}

/**
 * Email Service Interface
 */
export interface IEmailService {
  sendCoachInvitation(data: CoachInvitationEmailData): Promise<void>;
  sendEmail(data: EmailData): Promise<void>;
  sendVerificationEmail(data: VerificationEmailData): Promise<void>;
}

/**
 * Email Service Implementation
 */
export class EmailService implements IEmailService {
  private static instance: EmailService;
  private readonly isDevelopment: boolean;
  private readonly appName: string;
  private readonly supportEmail: string;
  private readonly fromEmail: string;
  private readonly brandColor: string;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.appName = 'Smarter Goalie';
    this.supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@smartergoalie.com';
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@smartergoalie.com';
    this.brandColor = '#2563eb'; // Blue-600
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send coach invitation email
   */
  public async sendCoachInvitation(data: CoachInvitationEmailData): Promise<void> {
    const { invitation, inviteUrl } = data;
    const appName = data.appName || this.appName;
    const supportEmail = data.supportEmail || this.supportEmail;

    const subject = `You're invited to join ${appName} as a Coach`;

    const html = this.generateCoachInvitationHtml({
      invitation,
      inviteUrl,
      appName,
      supportEmail,
    });

    const text = this.generateCoachInvitationText({
      invitation,
      inviteUrl,
      appName,
      supportEmail,
    });

    await this.sendEmail({
      to: invitation.email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send generic email
   */
  public async sendEmail(data: EmailData): Promise<void> {
    try {
      logDebug('Sending email', { to: data.to, subject: data.subject });

      if (this.isDevelopment || !resend) {
        // Development mode: Log to console
        console.log('\n' + '='.repeat(80));
        console.log('📧 EMAIL (Development Mode)');
        console.log('='.repeat(80));
        console.log(`To: ${data.to}`);
        console.log(`Subject: ${data.subject}`);
        console.log('-'.repeat(80));
        console.log('Text Content:');
        console.log(data.text || '(No text content)');
        console.log('-'.repeat(80));
        console.log('HTML Content:');
        console.log(data.html);
        console.log('='.repeat(80) + '\n');

        logInfo('Email logged to console (development mode)', {
          to: data.to,
          subject: data.subject,
        });
      } else {
        // Production mode: Send via Resend
        const result = await resend.emails.send({
          from: `${this.appName} <${this.fromEmail}>`,
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        logInfo('Email sent successfully via Resend', {
          to: data.to,
          subject: data.subject,
          messageId: result.data?.id,
        });
      }
    } catch (error) {
      logError('Failed to send email', error instanceof Error ? error : undefined, { error: String(error) });
      throw new Error('Failed to send email');
    }
  }

  /**
   * Generate HTML content for coach invitation email
   */
  private generateCoachInvitationHtml(data: {
    invitation: CoachInvitation;
    inviteUrl: string;
    appName: string;
    supportEmail: string;
  }): string {
    const { invitation, inviteUrl, appName, supportEmail } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coach Invitation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .info-box { background-color: white; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏒 Coach Invitation</h1>
    </div>
    <div class="content">
      <h2>Hello${invitation.metadata?.firstName ? ` ${invitation.metadata.firstName}` : ''}!</h2>

      <p>
        <strong>${invitation.invitedByName}</strong> has invited you to join <strong>${appName}</strong> as a coach.
      </p>

      ${invitation.metadata?.organizationName ? `
      <div class="info-box">
        <strong>Organization:</strong> ${invitation.metadata.organizationName}
      </div>
      ` : ''}

      ${invitation.metadata?.customMessage ? `
      <div class="info-box">
        <strong>Message from ${invitation.invitedByName}:</strong><br>
        <em>"${invitation.metadata.customMessage}"</em>
      </div>
      ` : ''}

      <p>Click the button below to accept this invitation and create your coach account:</p>

      <div style="text-align: center;">
        <a href="${inviteUrl}" class="button">Accept Invitation</a>
      </div>

      <p style="font-size: 14px; color: #6b7280;">
        Or copy and paste this link into your browser:<br>
        <a href="${inviteUrl}" style="color: #2563eb;">${inviteUrl}</a>
      </p>

      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        This invitation will expire on <strong>${invitation.expiresAt.toLocaleDateString()}</strong>.
      </p>
    </div>
    <div class="footer">
      <p>
        If you did not expect this invitation, you can safely ignore this email.<br>
        Questions? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>
      </p>
      <p style="margin-top: 15px;">
        © ${new Date().getFullYear()} ${appName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text content for coach invitation email
   */
  private generateCoachInvitationText(data: {
    invitation: CoachInvitation;
    inviteUrl: string;
    appName: string;
    supportEmail: string;
  }): string {
    const { invitation, inviteUrl, appName, supportEmail } = data;

    let text = `
COACH INVITATION
${appName}

Hello${invitation.metadata?.firstName ? ` ${invitation.metadata.firstName}` : ''}!

${invitation.invitedByName} has invited you to join ${appName} as a coach.
`;

    if (invitation.metadata?.organizationName) {
      text += `\nOrganization: ${invitation.metadata.organizationName}\n`;
    }

    if (invitation.metadata?.customMessage) {
      text += `\nMessage from ${invitation.invitedByName}:\n"${invitation.metadata.customMessage}"\n`;
    }

    text += `
To accept this invitation and create your coach account, visit:
${inviteUrl}

This invitation will expire on ${invitation.expiresAt.toLocaleDateString()}.

If you did not expect this invitation, you can safely ignore this email.
Questions? Contact us at ${supportEmail}

© ${new Date().getFullYear()} ${appName}. All rights reserved.
    `.trim();

    return text;
  }

  /**
   * Send email verification email with Smarter Goalie branding
   */
  public async sendVerificationEmail(data: VerificationEmailData): Promise<void> {
    const { to, displayName, verificationLink } = data;

    const subject = `Verify your email for ${this.appName}`;

    const html = this.generateVerificationEmailHtml({
      displayName,
      verificationLink,
    });

    const text = this.generateVerificationEmailText({
      displayName,
      verificationLink,
    });

    await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Generate HTML content for verification email
   */
  private generateVerificationEmailHtml(data: {
    displayName: string;
    verificationLink: string;
  }): string {
    const { displayName, verificationLink } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5; }
    .wrapper { padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, ${this.brandColor} 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header .logo { font-size: 48px; margin-bottom: 15px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1f2937; margin-top: 0; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background-color: ${this.brandColor}; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
    .button:hover { background-color: #1d4ed8; }
    .link-text { font-size: 14px; color: #6b7280; margin-top: 20px; word-break: break-all; }
    .link-text a { color: ${this.brandColor}; }
    .footer { background-color: #f9fafb; padding: 25px 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 5px 0; }
    .highlight { background-color: #eff6ff; border-left: 4px solid ${this.brandColor}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">🥅</div>
        <h1>${this.appName}</h1>
      </div>
      <div class="content">
        <h2>Welcome${displayName ? `, ${displayName}` : ''}!</h2>

        <p>Thanks for signing up for <strong>${this.appName}</strong>. To get started with your goalie training journey, please verify your email address.</p>

        <div class="highlight">
          <strong>Why verify?</strong> Email verification helps us keep your account secure and ensures you receive important updates about your training progress.
        </div>

        <div class="button-container">
          <a href="${verificationLink}" class="button">Verify Email Address</a>
        </div>

        <div class="link-text">
          <p>Or copy and paste this link into your browser:</p>
          <a href="${verificationLink}">${verificationLink}</a>
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          This link will expire in 24 hours. If you didn't create an account with ${this.appName}, you can safely ignore this email.
        </p>
      </div>
      <div class="footer">
        <p>Questions? Contact us at <a href="mailto:${this.supportEmail}" style="color: ${this.brandColor};">${this.supportEmail}</a></p>
        <p style="margin-top: 15px;">© ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text content for verification email
   */
  private generateVerificationEmailText(data: {
    displayName: string;
    verificationLink: string;
  }): string {
    const { displayName, verificationLink } = data;

    return `
VERIFY YOUR EMAIL
${this.appName}

Welcome${displayName ? `, ${displayName}` : ''}!

Thanks for signing up for ${this.appName}. To get started with your goalie training journey, please verify your email address by visiting the link below:

${verificationLink}

Why verify? Email verification helps us keep your account secure and ensures you receive important updates about your training progress.

This link will expire in 24 hours. If you didn't create an account with ${this.appName}, you can safely ignore this email.

Questions? Contact us at ${this.supportEmail}

© ${new Date().getFullYear()} ${this.appName}. All rights reserved.
    `.trim();
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
