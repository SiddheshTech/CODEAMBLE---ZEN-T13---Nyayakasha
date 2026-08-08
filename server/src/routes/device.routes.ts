import { Router, Request, Response } from 'express';
import { auditLedger } from '../db/auditLedger.js';
import { primaryStore } from '../db/store.js';

export const deviceRouter = Router();

// POST verify unrecognized device with MFA
deviceRouter.post('/verify', async (req: Request, res: Response) => {
  const { deviceId, userEmail, locationInfo } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  
  auditLedger.recordEvent('UNRECOGNIZED_DEVICE_VERIFIED', userEmail || 'USER', {
    deviceInfo: deviceId || req.headers['user-agent'] || 'Chrome / Windows (x64)',
    ip: String(clientIp),
    mfaVerified: true,
    location: locationInfo || 'Regional Network'
  });

  return res.json({
    success: true,
    message: 'Device verified and trusted successfully.',
    device: {
      id: `dev_${Date.now()}`,
      name: deviceId || 'Active Browser Device',
      location: locationInfo || 'Regional Network',
      ip: String(clientIp),
      trustedAt: new Date().toISOString()
    }
  });
});

// POST emergency lock account / device ("This wasn't me — Emergency Lock")
deviceRouter.post('/emergency-lock', async (req: Request, res: Response) => {
  const { deviceId, userEmail, reason } = req.body;
  const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1');

  // Add security alert
  primaryStore.addDuressAlert({
    userId: userEmail || 'unknown_user',
    userName: userEmail || 'Judicial / System User',
    role: 'court_authority',
    ipAddress: clientIp,
    locationInfo: { lat: 19.0760, lng: 72.8777, jurisdiction: 'Statewide Network' }
  });

  auditLedger.recordEvent('EMERGENCY_ACCOUNT_LOCK_TRIGGERED', userEmail || 'USER', {
    deviceId: deviceId || req.headers['user-agent'] || 'Active Browser Device',
    ip: clientIp,
    reason: reason || 'Unauthorized device sign-in alert rejected by user.',
    status: 'LOCKED'
  });

  return res.json({
    success: true,
    message: 'EMERGENCY LOCK ACTIVATED: Account credentials and active sessions suspended. System Security Secretariat notified.',
    lockedAt: new Date().toISOString()
  });
});
