import { sha256 } from '../utils/crypto.js';
class AuditLedger {
    chain = [];
    genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
    constructor() {
        // Record Genesis Entry
        this.appendEvent({
            eventType: 'SYSTEM_INITIALIZATION',
            userId: 'SYSTEM',
            userRole: 'SYSTEM',
            ipAddress: '127.0.0.1',
            details: { message: 'NYAYAKASHA Audit Ledger Initialized' }
        });
    }
    appendEvent(params) {
        const index = this.chain.length;
        const timestamp = new Date().toISOString();
        const prevHash = index === 0 ? this.genesisHash : this.chain[index - 1].hash;
        const detailsObj = params.details || {};
        const payloadHash = sha256(JSON.stringify(detailsObj));
        const id = `audit_${Date.now()}_${index}`;
        const rawContent = `${prevHash}|${index}|${timestamp}|${params.eventType}|${params.userId}|${params.userRole}|${payloadHash}`;
        const hash = sha256(rawContent);
        const entry = {
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
        return entry;
    }
    getChain() {
        return [...this.chain];
    }
    verifyIntegrity() {
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
