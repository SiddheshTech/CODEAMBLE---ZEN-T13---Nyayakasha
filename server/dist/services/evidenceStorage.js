import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
const VAULT_DIR = path.join(process.cwd(), 'encrypted_evidence_vault');
if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
}
/**
 * Backend-only Encrypted Evidence File Storage Service.
 * Security Contract: Direct client access to Firebase Storage / Vault is strictly DENIED
 * (Security Rule: `allow read, write: if false` at Firebase Storage level).
 * All file reads & writes must route exclusively through the Node Express backend.
 */
export async function storeEvidenceFile(fileBuffer, originalName, mimeType, sha256Hash) {
    const timestamp = Date.now();
    const safeFilename = `${sha256Hash.substring(0, 16)}_${timestamp}_${path.basename(originalName)}`;
    const destinationPath = path.join(VAULT_DIR, safeFilename);
    // Encrypt buffer before saving to disk/storage using AES-256-GCM
    const masterKey = crypto.scryptSync(process.env.STORAGE_ENCRYPTION_KEY || 'nyayakasha_master_vault_key_2026', 'salt', 32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
    const encryptedBuffer = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final(),
        cipher.getAuthTag()
    ]);
    // Save IV (12 bytes) + Encrypted Payload to secure vault
    const finalBuffer = Buffer.concat([iv, encryptedBuffer]);
    fs.writeFileSync(destinationPath, finalBuffer);
    return {
        storagePath: `vault://${safeFilename}`,
        fileSize: fileBuffer.length,
        encrypted: true,
        mimeType,
        uploadedAt: new Date().toISOString()
    };
}
