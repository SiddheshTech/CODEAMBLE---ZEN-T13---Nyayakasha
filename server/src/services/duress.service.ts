import { hashPassword, verifyPassword, safeCompareString } from '../utils/crypto.js';
import { primaryStore, DuressAlert, UserRecord } from '../db/store.js';
import { auditLedger } from '../db/auditLedger.js';
import { WebSocket } from 'ws';

// Global Event Subscribers for Independent Validator Real-time Alerts
const validatorSockets = new Set<WebSocket>();

export function registerValidatorSocket(ws: WebSocket) {
  validatorSockets.add(ws);
  ws.on('close', () => validatorSockets.delete(ws));
}

/**
 * Set Dual PIN (Real PIN + Duress PIN)
 */
export async function setDualPins(user: UserRecord, realPin: string, duressPin: string): Promise<UserRecord> {
  const realPinHash = await hashPassword(realPin);
  const duressPinHash = await hashPassword(duressPin);

  user.realPinHash = realPinHash;
  user.duressPinHash = duressPinHash;

  await primaryStore.saveUser(user);

  auditLedger.appendEvent({
    eventType: 'DURESS_PIN_ENROLLED',
    userId: user.id,
    userRole: user.role,
    details: { hasDuressPin: true, optInRole: user.role }
  });

  return user;
}

/**
 * Verify PIN with Constant-Time Check & Silent Duress Dispatch
 */
export async function verifyPinAndHandleDuress(
  user: UserRecord,
  inputPin: string,
  clientIp: string = '127.0.0.1',
  locationInfo?: { lat: number; lng: number; jurisdiction?: string }
): Promise<{ isMatch: boolean; isDuress: boolean }> {
  if (!user.realPinHash || !user.duressPinHash) {
    // If user has not enrolled PINs yet, auto-enroll input PIN as real PIN & default duress PIN
    const duressPinFallback = inputPin === '9999' ? '8888' : '9999';
    await setDualPins(user, inputPin, duressPinFallback);
    return { isMatch: true, isDuress: false };
  }

  // Evaluate both real and duress PINs concurrently to maintain equal latency
  const [isRealMatch, isDuressMatch] = await Promise.all([
    verifyPassword(inputPin, user.realPinHash),
    verifyPassword(inputPin, user.duressPinHash)
  ]);

  if (isDuressMatch) {
    // Silent alert dispatch - NO UI visible indication
    const alert = primaryStore.addDuressAlert({
      userId: user.id,
      userName: user.fullName,
      role: user.role,
      ipAddress: clientIp,
      locationInfo
    });

    // Append covert event to hash-chained security log
    auditLedger.appendEvent({
      eventType: 'SILENT_DURESS_ALERT_TRIGGERED',
      userId: user.id,
      userRole: user.role,
      ipAddress: clientIp,
      details: { alertId: alert.id, status: 'DISPATCHED_TO_VALIDATOR_BUS' }
    });

    // Notify connected Independent Validator WebSockets covertly
    notifyValidatorSockets({ type: 'DURESS_ALERT', alert });

    return { isMatch: true, isDuress: true };
  }

  if (isRealMatch) {
    return { isMatch: true, isDuress: false };
  }

  return { isMatch: false, isDuress: false };
}

export function notifyValidatorSockets(data: any) {
  const payload = JSON.stringify(data);
  validatorSockets.forEach(socket => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  });
}
