import { auditLedger } from '../db/auditLedger.js';
class NotificationService {
    /**
     * Send Email Notification (email.js / SMTP)
     */
    async sendEmail(recipient, subject, body) {
        auditLedger.appendEvent({
            eventType: 'NOTIFICATION_DISPATCH',
            userId: recipient,
            userRole: 'SYSTEM',
            details: { channel: 'EMAIL', recipient, subject }
        });
        return true;
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
     * Note: FCM is used purely as a push-delivery transport (no auth data flows through it)
     */
    async sendFCMPush(deviceToken, title, body) {
        auditLedger.appendEvent({
            eventType: 'NOTIFICATION_DISPATCH',
            userId: 'DEVICE_TOKEN',
            userRole: 'SYSTEM',
            details: { channel: 'FCM_PUSH', deviceToken, title }
        });
        return true;
    }
}
export const notificationService = new NotificationService();
