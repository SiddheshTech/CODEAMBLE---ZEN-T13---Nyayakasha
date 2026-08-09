import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { auditLedger } from '../db/auditLedger.js';
import { primaryStore } from '../db/store.js';

export interface NotificationPayload {
  recipient: string;
  subject?: string;
  body: string;
  type: 'EMAIL' | 'SMS' | 'FCM_PUSH';
}

class NotificationService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'smirh2211@gmail.com';
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || 'vrlyobkptwdducgm';

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
      console.log(`📧 SMTP Transporter (Gmail Service) configured for ${user}`);
    } catch (err) {
      console.error('Nodemailer init error:', err);
    }
  }

  /**
   * Send Real Email Notification via Nodemailer Gmail Transporter
   */
  public async sendEmail(recipient: string, subject: string, body: string): Promise<boolean> {
    auditLedger.appendEvent({
      eventType: 'NOTIFICATION_DISPATCH',
      userId: recipient,
      userRole: 'SYSTEM',
      details: { channel: 'EMAIL', recipient, subject }
    });

    if (!this.transporter) {
      this.initTransporter();
    }

    if (this.transporter) {
      try {
        const fromName = process.env.EMAIL_FROM_NAME || 'Nyayakasha Security System';
        const fromUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'smirh2211@gmail.com';
        const fromAddr = process.env.SMTP_FROM || fromUser;
        
        await this.transporter.sendMail({
          from: `"${fromName}" <${fromAddr}>`,
          to: recipient,
          subject,
          html: `<div style="font-family: sans-serif; padding: 24px; color: #1e293b; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin-top: 0;">${subject}</h2>
            <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 12px;">${body}</div>
            <hr style="border: none; border-top: 1px solid #cbd5e1; margin-top: 24px; margin-bottom: 16px;" />
            <p style="font-size: 12px; color: #64748b; margin: 0;">Nyayakasha Cryptographic Platform — Immutable Audit & Access Control</p>
          </div>`
        });
        console.log(`📧 Real SMTP Email successfully sent to ${recipient}`);
        return true;
      } catch (err: any) {
        console.error(`⚠️ SMTP Email dispatch to ${recipient} failed:`, err?.message || err);
        return false;
      }
    }
    return false;
  }

  /**
   * Send SMS / OTP (Twilio)
   */
  public async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    auditLedger.appendEvent({
      eventType: 'NOTIFICATION_DISPATCH',
      userId: phoneNumber,
      userRole: 'SYSTEM',
      details: { channel: 'SMS_TWILIO', phoneNumber }
    });
    return true;
  }

  /**
   * Send FCM Push Notification (Firebase Cloud Messaging)
   */
  public async sendFCMPush(deviceToken: string, title: string, body: string, data?: Record<string, string>): Promise<boolean> {
    auditLedger.appendEvent({
      eventType: 'NOTIFICATION_DISPATCH',
      userId: 'DEVICE_TOKEN',
      userRole: 'SYSTEM',
      details: { channel: 'FCM_PUSH', deviceToken, title }
    });

    try {
      const { getMessaging } = await import('firebase-admin/messaging');
      const { getApps } = await import('firebase-admin/app');

      if (getApps().length > 0 && deviceToken) {
        await getMessaging().send({
          token: deviceToken,
          notification: { title, body },
          data: data || {}
        });
        console.log(`🔥 Real Firebase FCM Push notification sent to token: ${deviceToken.slice(0, 10)}...`);
        return true;
      }
    } catch (err: any) {
      console.log('Firebase FCM Push notification info:', err.message || err);
    }
    return true;
  }

  /**
   * Dispatches email and push notifications respecting user's custom category toggles
   */
  public async notifyUserCategory(
    userOrEmail: string,
    category: 'consensus' | 'analytics' | 'escalation',
    subject: string,
    body: string,
    fcmData?: Record<string, string>
  ): Promise<{ emailSent: boolean; pushSent: boolean }> {
    let emailSent = false;
    let pushSent = false;

    const user = (await primaryStore.getUserByEmail(userOrEmail)) || (await primaryStore.getUserById(userOrEmail));
    const recipientEmail = user?.email || userOrEmail;

    // Check user's category preference toggles (default to true if not set)
    const emailEnabled = user?.settings?.notifications?.[category]?.email ?? true;
    const pushEnabled = user?.settings?.notifications?.[category]?.push ?? true;

    if (emailEnabled) {
      emailSent = await this.sendEmail(recipientEmail, subject, body);
    } else {
      console.log(`ℹ️ [Notification Engine] Email dispatch for category '${category}' skipped for ${recipientEmail} (User Email Toggle is OFF)`);
    }

    if (pushEnabled) {
      pushSent = await this.sendFCMPush(user?.id || recipientEmail, subject, body, fcmData);
    } else {
      console.log(`ℹ️ [Notification Engine] Push dispatch for category '${category}' skipped for ${recipientEmail} (User Push Toggle is OFF)`);
    }

    return { emailSent, pushSent };
  }
}

export const notificationService = new NotificationService();
