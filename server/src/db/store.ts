export type UserRole = 'field_submitter' | 'court_authority' | 'independent_validator';

export type ApprovalState = 'submitted' | 'institution_review' | 'dual_check' | 'vetting' | 'mfa_pending' | 'active' | 'rejected';

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  passwordHash: string;
  duressPinHash?: string; // Opt-in for Field Submitter & Court Authority
  realPinHash?: string;
  publicKeyPem?: string; // Client-side generated public key stored on server
  
  // Institutional Details
  institutionId?: string;
  badgeId?: string;
  barCouncilNumber?: string;
  jurisdictionCode?: string; // e.g. "MH-MUM-DIST-01"
  uploadedDocumentUrl?: string;
  documentBlurScore?: number;
  documentPassesQuality?: boolean;

  // Approval State Machine
  approvalState: ApprovalState;
  stateHistory: Array<{ state: ApprovalState; timestamp: string; note?: string }>;
  institutionVerified: boolean;
  vettingApproved: boolean;

  // MFA Details
  mfaEnrolled: boolean;
  mfaType?: 'webauthn' | 'totp';
  totpSecret?: string;
  webauthnCredentialId?: string;
  webauthnPublicKey?: string;
  webauthnCounter?: number;
  webauthnHardwareAttested?: boolean; // Required for Validator

  createdAt: string;
  updatedAt: string;
}

export interface DuressAlert {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  ipAddress: string;
  locationInfo?: { lat: number; lng: number; jurisdiction?: string };
  status: 'UNACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
}

import fs from 'fs';
import path from 'path';
import { getFirestore } from './firebase.js';

const DATA_FILE = path.join(process.cwd(), 'nyayakasha_store_data.json');

class PrimaryDataStore {
  private users = new Map<string, UserRecord>();
  private usersByEmail = new Map<string, UserRecord>();
  private duressAlerts: DuressAlert[] = [];
  private vettingQueue: Array<{ id: string; userId: string; submittedAt: string; consentGiven: boolean }> = [];

  constructor() {
    this.loadFromDisk();
    this.loadFromFirestore();
  }

  private async loadFromFirestore() {
    const db = getFirestore();
    if (!db) return;
    try {
      const usersSnap = await db.collection('users').get();
      usersSnap.forEach((doc) => {
        const u = doc.data() as UserRecord;
        this.users.set(u.id, u);
        this.usersByEmail.set(u.email.toLowerCase(), u);
      });

      const duressSnap = await db.collection('duress_alerts').orderBy('timestamp', 'desc').get();
      const loadedAlerts: DuressAlert[] = [];
      duressSnap.forEach((doc) => loadedAlerts.push(doc.data() as DuressAlert));
      if (loadedAlerts.length > 0) this.duressAlerts = loadedAlerts;

      const vettingSnap = await db.collection('vetting_queue').get();
      const loadedVetting: Array<{ id: string; userId: string; submittedAt: string; consentGiven: boolean }> = [];
      vettingSnap.forEach((doc) => loadedVetting.push(doc.data() as any));
      if (loadedVetting.length > 0) this.vettingQueue = loadedVetting;
      
      console.log('🔥 Synced data from Firebase Firestore');
    } catch (err) {
      console.log('Firestore load info:', err);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.users && Array.isArray(data.users)) {
          data.users.forEach((user: UserRecord) => {
            this.users.set(user.id, user);
            this.usersByEmail.set(user.email.toLowerCase(), user);
          });
        }
        if (data.duressAlerts && Array.isArray(data.duressAlerts)) {
          this.duressAlerts = data.duressAlerts;
        }
        if (data.vettingQueue && Array.isArray(data.vettingQueue)) {
          this.vettingQueue = data.vettingQueue;
        }
      }
    } catch (err) {
      console.log('Info: Disk store load status:', err);
    }
  }

  private persistToDisk() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        duressAlerts: this.duressAlerts,
        vettingQueue: this.vettingQueue
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.log('Error writing to disk store:', err);
    }
  }

  public async saveUser(user: UserRecord): Promise<UserRecord> {
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase(), user);
    this.persistToDisk();

    // Real-time Firestore sync
    const db = getFirestore();
    if (db) {
      db.collection('users').doc(user.id).set(user, { merge: true }).catch(err => console.log('Firestore save user err:', err));
    }

    return user;
  }

  public async getUserById(id: string): Promise<UserRecord | undefined> {
    return this.users.get(id);
  }

  public async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    return this.usersByEmail.get(email.toLowerCase());
  }

  public async getAllUsers(): Promise<UserRecord[]> {
    return Array.from(this.users.values());
  }

  // Duress Alerts
  public addDuressAlert(alert: Omit<DuressAlert, 'id' | 'timestamp' | 'status'>): DuressAlert {
    const record: DuressAlert = {
      ...alert,
      id: `alert_dur_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      status: 'UNACKNOWLEDGED'
    };
    this.duressAlerts.unshift(record);
    this.persistToDisk();

    const db = getFirestore();
    if (db) {
      db.collection('duress_alerts').doc(record.id).set(record).catch(err => console.log('Firestore duress alert err:', err));
    }

    return record;
  }

  public getDuressAlerts(): DuressAlert[] {
    return [...this.duressAlerts];
  }

  // Vetting Queue for Validator
  public addToVettingQueue(userId: string, consentGiven: boolean) {
    const item = {
      id: `vet_${Date.now()}`,
      userId,
      submittedAt: new Date().toISOString(),
      consentGiven
    };
    this.vettingQueue.push(item);
    this.persistToDisk();

    const db = getFirestore();
    if (db) {
      db.collection('vetting_queue').doc(item.id).set(item).catch(err => console.log('Firestore vetting queue err:', err));
    }

    return item;
  }

  public getVettingQueue() {
    return [...this.vettingQueue];
  }
}

export const primaryStore = new PrimaryDataStore();
