import fs from 'fs';
import path from 'path';
import { sha256 } from '../utils/crypto.js';

const AUDIT_FILE = path.join(process.cwd(), 'nyayakasha_audit_ledger.json');

export interface AuditLogEntry {
  id: string;
  index: number;
  timestamp: string;
  eventType: string;
  userId: string;
  userRole: string;
  ipAddress: string;
  details: Record<string, any>;
  payloadHash: string;
  prevHash: string;
  hash: string;
}

class AuditLedger {
  private chain: AuditLogEntry[] = [];
  private genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.loadFromDisk();
    if (this.chain.length === 0) {
      // Record Genesis Entry if brand new chain
      this.appendEvent({
        eventType: 'SYSTEM_INITIALIZATION',
        userId: 'SYSTEM',
        userRole: 'SYSTEM',
        ipAddress: '127.0.0.1',
        details: { message: 'NYAYAKASHA Audit Ledger Initialized' }
      });
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(AUDIT_FILE)) {
        const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          this.chain = data;
        }
      }
    } catch (err) {
      console.log('Info: Audit ledger load status:', err);
    }
  }

  private persistToDisk() {
    try {
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(this.chain, null, 2), 'utf-8');
    } catch (err) {
      console.log('Error writing audit ledger to disk:', err);
    }
  }

  public appendEvent(params: {
    eventType: string;
    userId: string;
    userRole: string;
    ipAddress?: string;
    details?: Record<string, any>;
  }): AuditLogEntry {
    const index = this.chain.length;
    const timestamp = new Date().toISOString();
    const prevHash = index === 0 ? this.genesisHash : this.chain[index - 1].hash;
    const detailsObj = params.details || {};
    const payloadHash = sha256(JSON.stringify(detailsObj));

    const id = `audit_${Date.now()}_${index}`;
    const rawContent = `${prevHash}|${index}|${timestamp}|${params.eventType}|${params.userId}|${params.userRole}|${payloadHash}`;
    const hash = sha256(rawContent);

    const entry: AuditLogEntry = {
      id,
      index,
      timestamp,
      eventType: params.eventType,
      userId: params.userId,
      userRole: params.userRole,
      ipAddress: params.ipAddress || '0.0.0.0',
      details: detailsObj,
      payloadHash,
      prevHash,
      hash
    };

    this.chain.push(entry);
    this.persistToDisk();
    return entry;
  }

  public getChain(): AuditLogEntry[] {
    return [...this.chain];
  }

  public verifyIntegrity(): { isValid: boolean; brokenAt?: number } {
    for (let i = 0; i < this.chain.length; i++) {
      const entry = this.chain[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.chain[i - 1].hash;

      if (entry.prevHash !== expectedPrevHash) {
        return { isValid: false, brokenAt: i };
      }

      const recalculatedPayloadHash = sha256(JSON.stringify(entry.details));
      if (entry.payloadHash !== recalculatedPayloadHash) {
        return { isValid: false, brokenAt: i };
      }

      const rawContent = `${entry.prevHash}|${entry.index}|${entry.timestamp}|${entry.eventType}|${entry.userId}|${entry.userRole}|${entry.payloadHash}`;
      const recalculatedHash = sha256(rawContent);

      if (entry.hash !== recalculatedHash) {
        return { isValid: false, brokenAt: i };
      }
    }
    return { isValid: true };
  }
}

export const auditLedger = new AuditLedger();
