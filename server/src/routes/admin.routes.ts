import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';
import { primaryStore } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';

export const adminRouter = Router();

// ─── SMTP Transporter (own instance, not shared) ──────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,            // false = STARTTLS (port 587) — NOT blocked unlike 465
    auth: {
      user: process.env.SMTP_USER || process.env.GMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASS,
    },
    requireTLS: true,         // force STARTTLS upgrade
    tls: { rejectUnauthorized: false }
  });
}

async function sendInviteEmail(to: string, role: string, link: string): Promise<{ ok: boolean; error?: string }> {
  const from = `"Nyayakasha Higher Authority" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`;
  const subject = `🔐 Nyayakasha — Secure Invite: ${role} Access`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: #000; padding: 28px 32px;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Nyayakasha Forensic Suite</h1>
        <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Higher Authority Secure Invitation</p>
      </div>
      <div style="padding: 32px;">
        <p style="font-size: 15px; color: #374151; line-height: 1.6;">
          You have been authorized by the <strong>Higher Authority</strong> of the Nyayakasha Forensic Platform to register as a:
        </p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
          <span style="font-size: 18px; font-weight: 700; color: #111827;">🛡️ ${role}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
          Click the button below to complete your institutional registration and set up mandatory multi-factor authentication. This is a one-time link for your designated role.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; letter-spacing: -0.2px;">
            Complete Registration →
          </a>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
          If the button does not work, copy this link:<br/>
          <span style="color: #3b82f6;">${link}</span>
        </p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from, to, subject, html });
    console.log(`✅ Invite email sent to ${to}`);
    return { ok: true };
  } catch (err: any) {
    console.error(`❌ SMTP invite email failed to ${to}:`, err.message);
    return { ok: false, error: err.message };
  }
}

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
const requireAdmin = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No admin token provided.' });
  }
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    if (decoded.role !== 'higher_authority') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized as higher authority.' });
    }
    (req as any).adminId = decoded.adminId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid admin token.' });
  }
};

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/login
 */
adminRouter.post('/login', async (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === 'admin' || password === 'admin123') {
    const token = jwt.sign(
      { adminId: 'ha_admin_01', role: 'higher_authority' },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );
    auditLedger.appendEvent({
      eventType: 'AUTH_SUCCESS',
      userId: 'ha_admin_01',
      userRole: 'higher_authority',
      details: { source: 'admin_login' }
    });
    return res.json({ token, message: 'Higher authority logged in.' });
  }
  return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid admin passkey.' });
});

/**
 * POST /api/admin/invite/send
 * Generates the role-locked link and sends it via real SMTP email.
 */
adminRouter.post('/invite/send', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, role, link } = req.body;
    if (!email || !role || !link) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'email, role, and link are required.' });
    }

    const result = await sendInviteEmail(email, role, link);

    auditLedger.appendEvent({
      eventType: 'INVITE_LINK_GENERATED',
      userId: 'ha_admin_01',
      userRole: 'higher_authority',
      details: { recipientEmail: email, targetRole: role, emailSent: result.ok }
    });

    if (result.ok) {
      return res.json({ success: true, message: `✅ Invite successfully sent to ${email}` });
    } else {
      return res.status(500).json({
        error: 'EMAIL_FAILED',
        message: `❌ Failed to send email to ${email}. SMTP Error: ${result.error}`
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * GET /api/admin/pending
 * Returns all users awaiting Higher Authority approval.
 */
adminRouter.get('/pending', requireAdmin, async (req: Request, res: Response) => {
  try {
    const allUsers = await primaryStore.getAllUsers();
    // All non-active, non-rejected states are "pending" approval from the Higher Authority
    const pendingStates = ['submitted', 'institution_review', 'dual_check', 'vetting', 'mfa_pending'];
    const pending = allUsers.filter(u => pendingStates.includes(u.approvalState));

    const mapped = pending.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      approvalState: u.approvalState,       // raw state for reference
      status: 'PENDING' as const,           // always show as PENDING to HA until approved/rejected
      timestamp: u.createdAt
    }));

    return res.json(mapped);
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * POST /api/admin/approve
 * Approves a user — bypasses the strict state machine to force-approve from any pending state.
 */
adminRouter.post('/approve', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'MISSING_USER_ID', message: 'userId is required.' });
    }

    const user = await primaryStore.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found.' });
    }

    // Force-approve: bypass the strict state machine from any state
    const prevState = user.approvalState;
    user.institutionVerified = true;
    user.vettingApproved = true;
    user.approvalState = 'mfa_pending';
    user.stateHistory.push({
      state: 'mfa_pending',
      timestamp: new Date().toISOString(),
      note: 'Directly approved by Higher Authority'
    });
    user.updatedAt = new Date().toISOString();
    await primaryStore.saveUser(user);

    auditLedger.appendEvent({
      eventType: 'APPROVAL_STATE_TRANSITION',
      userId: user.id,
      userRole: user.role,
      details: { fromState: prevState, toState: 'mfa_pending', actorRole: 'higher_authority', note: 'Approved by Higher Authority' }
    });

    return res.json({ message: `User ${user.email} approved successfully.`, approvalState: 'mfa_pending' });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

/**
 * POST /api/admin/decline
 * Declines a user.
 */
adminRouter.post('/decline', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'MISSING_USER_ID', message: 'userId is required.' });
    }

    const user = await primaryStore.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found.' });

    const prevState = user.approvalState;
    user.approvalState = 'rejected';
    user.stateHistory.push({
      state: 'rejected',
      timestamp: new Date().toISOString(),
      note: 'Declined by Higher Authority'
    });
    user.updatedAt = new Date().toISOString();
    await primaryStore.saveUser(user);

    auditLedger.appendEvent({
      eventType: 'APPROVAL_STATE_TRANSITION',
      userId: user.id,
      userRole: user.role,
      details: { fromState: prevState, toState: 'rejected', actorRole: 'higher_authority', note: 'Declined by Higher Authority' }
    });

    return res.json({ message: `User ${user.email} declined.` });
  } catch (error: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});
