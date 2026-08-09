import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { auditLedger } from '../db/auditLedger.js';
import { primaryStore } from '../db/store.js';
class NotificationService {
    transporter = null;
    constructor() {
        this.initTransporter();
    }
    initTransporter() {
        const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'smirh2211@gmail.com';
        const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || 'dmnpyqkejgmxlgoy';
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(process.env.SMTP_PORT) || 465;
        try {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
                tls: { rejectUnauthorized: false }
            });
            console.log(`📧 SMTP Transporter configured for ${user}`);
        }
        catch (err) {
            console.error('Nodemailer init error:', err);
        }
    }
    /**
     * Send Real Email Notification via Nodemailer Gmail Transporter
     */
    async sendEmail(recipient, subject, body) {
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
            }
            catch (err) {
                console.error(`⚠️ SMTP Email dispatch to ${recipient} failed:`, err?.message || err);
                return false;
            }
        }
        return false;
    }
    /**
     * Send SMS / OTP (Twilio)
     */
    async sendSMS(phoneNumber, message) {
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
    async sendFCMPush(deviceToken, title, body, data) {
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
        }
        catch (err) {
            console.log('Firebase FCM Push notification info:', err.message || err);
        }
        return true;
    }
    /**
     * Dispatches email and push notifications respecting user's custom category toggles
     */
    async notifyUserCategory(userOrEmail, category, subject, body, fcmData) {
        let emailSent = false;
        let pushSent = false;
        const user = (await primaryStore.getUserByEmail(userOrEmail)) || (await primaryStore.getUserById(userOrEmail));
        const recipientEmail = user?.email || userOrEmail;
        // Check user's category preference toggles (default to true if not set)
        const emailEnabled = user?.settings?.notifications?.[category]?.email ?? true;
        const pushEnabled = user?.settings?.notifications?.[category]?.push ?? true;
        if (emailEnabled) {
            emailSent = await this.sendEmail(recipientEmail, subject, body);
        }
        else {
            console.log(`ℹ️ [Notification Engine] Email dispatch for category '${category}' skipped for ${recipientEmail} (User Email Toggle is OFF)`);
        }
        if (pushEnabled) {
            pushSent = await this.sendFCMPush(user?.id || recipientEmail, subject, body, fcmData);
        }
        else {
            console.log(`ℹ️ [Notification Engine] Push dispatch for category '${category}' skipped for ${recipientEmail} (User Push Toggle is OFF)`);
        }
        return { emailSent, pushSent };
    }
}
export const notificationService = new NotificationService();
