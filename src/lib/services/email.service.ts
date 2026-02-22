/**
 * Email Service
 *
 * Handles sending emails for various purposes (invitations, notifications, etc.)
 * Currently configured for development mode (console logging).
 * Can be easily integrated with real email services like SendGrid, AWS SES, etc.
 */

import { CoachInvitation } from '@/types/auth';
import { logInfo, logError, logDebug } from '@/lib/errors/error-logger';

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
 * Email Service Interface
 */
export interface IEmailService {
  sendCoachInvitation(data: CoachInvitationEmailData): Promise<void>;
  sendEmail(data: EmailData): Promise<void>;
}

/**
 * Email Service Implementation
 */
export class EmailService implements IEmailService {
  private static instance: EmailService;
  private readonly isDevelopment: boolean;
  private readonly appName: string;
  private readonly supportEmail: string;
  private readonly baseUrl: string;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.appName = process.env.NEXT_PUBLIC_APP_NAME || 'SportsGoalie';
    this.supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@sportsgoalie.com';
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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

      if (this.isDevelopment) {
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
        // Production mode: Integrate with email service
        // TODO: Integrate with SendGrid, AWS SES, or other email service
        // Example with SendGrid:
        // await sgMail.send({
        //   to: data.to,
        //   from: this.supportEmail,
        //   subject: data.subject,
        //   html: data.html,
        //   text: data.text,
        // });

        logInfo('Email sent successfully', { to: data.to, subject: data.subject });
      }
    } catch (error) {
      logError('Failed to send email', error);
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
}

// Export singleton instance
export const emailService = EmailService.getInstance();
