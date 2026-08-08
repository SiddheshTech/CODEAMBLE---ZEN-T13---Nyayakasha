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

export interface CaseRecord {
  id: string; // e.g. FIR-2026-001
  title: string;
  status: 'Active' | 'Pending Review' | 'Sealed' | 'Closed' | 'Cold Case';
  type: string;
  date: string;
  officer: string;
  evidenceCount: number;
  testimonyCount: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  location?: string;
  jurisdictionCode?: string;
  chainHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceRecord {
  id: string; // e.g. EV-8821
  caseId: string;
  title: string;
  type: 'Video' | 'Document' | 'Photo' | 'Audio' | 'Digital Asset';
  date: string;
  hash: string;
  status: 'Sealed' | 'Pending Chain Transfer' | 'Verified' | 'Flagged';
  fileUrl?: string;
  custodian?: string;
  incidentLocation?: string;
  confidentialityLevel?: string;
  customMetadata?: string;
  latitude?: number;
  longitude?: number;
  signature?: string;
  createdAt: string;
}

export interface ConsensusVote {
  validatorId: string;
  validatorName: string;
  vote: 'APPROVE' | 'REJECT' | 'FLAG_FORGERY';
  timestamp: string;
  note?: string;
}

export interface ConsensusRequest {
  id: string;
  caseId: string;
  caseTitle: string;
  exhibitId: string;
  exhibitTitle: string;
  submittedBy: string;
  requiredVotes: number;
  currentVotes: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged Forgery';
  votes: ConsensusVote[];
  createdAt: string;
}

export interface ForgeryReviewItem {
  id: string;
  exhibitId: string;
  caseId: string;
  title: string;
  type: string;
  submittedBy: string;
  timestamp: string;
  spectralScore: number;
  metadataIntegrityScore: number;
  perceptualDiffScore: number;
  aiConfidence: number;
  flagReason: string;
  status: 'Under Review' | 'Quarantined' | 'Cleared' | 'Escalated to Bench';
  notes?: string;
}

export interface IdentityUnlockRequest {
  id: string;
  caseId: string;
  caseTitle: string;
  witnessAlias: string;
  requestor: string;
  reason: string;
  thresholdRequired: number; // e.g. 3 of 5
  thresholdGranted: number;
  status: 'Pending' | 'Approved' | 'Denied';
  grantedBy: string[];
  createdAt: string;
}

export interface PrecedentFlagItem {
  id: string;
  caseId: string;
  caseTitle: string;
  precedentCitation: string;
  conflictDescription: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  systemAction: string;
  status: 'Flagged' | 'Resolved' | 'Overridden';
  resolvedBy?: string;
  resolvedAt?: string;
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
  
  private cases = new Map<string, CaseRecord>();
  private evidence = new Map<string, EvidenceRecord>();
  private consensusRequests: ConsensusRequest[] = [];
  private forgeryReviews: ForgeryReviewItem[] = [];
  private identityUnlocks: IdentityUnlockRequest[] = [];
  private precedentFlags: PrecedentFlagItem[] = [];

  // DECOY HONEYPOT DATASETS FOR DURESS SESSIONS
  private decoyCases = new Map<string, CaseRecord>();
  private decoyEvidence = new Map<string, EvidenceRecord>();
  private decoyConsensusRequests: ConsensusRequest[] = [];
  private decoyForgeryReviews: ForgeryReviewItem[] = [];

  constructor() {
    this.seedDefaults();
    this.loadFromDisk();
    this.loadFromFirestore();
  }

  private seedDefaults() {
    // Default Cases
    const defaultCases: CaseRecord[] = [
      { id: 'FIR-2026-001', title: 'State vs. Unknown (Sector 4 Cyber Heist)', status: 'Active', type: 'Cyber Crime', date: 'Oct 12, 2026', officer: 'Officer R. Kulkarni', evidenceCount: 14, testimonyCount: 3, priority: 'High', description: 'Unauthorized access and data exfiltration from city municipal servers. Traced to IP addresses in Zone 4.', location: 'Sector 4, Central Station', jurisdictionCode: 'MH-MUM-DIST-01', createdAt: '2026-10-12T10:00:00Z', updatedAt: '2026-10-12T10:00:00Z' },
      { id: 'FIR-2026-002', title: 'State vs. Deshmukh (Property Fraud)', status: 'Pending Review', type: 'Financial', date: 'Oct 10, 2026', officer: 'Inspector S. Patel', evidenceCount: 8, testimonyCount: 5, priority: 'Medium', description: 'Alleged forgery of land registry documents in the western suburbs.', location: 'Bandra West Sub-Registry', jurisdictionCode: 'MH-MUM-DIST-02', createdAt: '2026-10-10T11:30:00Z', updatedAt: '2026-10-10T11:30:00Z' },
      { id: 'FIR-2026-003', title: 'Vehicle Theft Ring - Highway 9', status: 'Active', type: 'Theft', date: 'Oct 08, 2026', officer: 'Officer R. Kulkarni', evidenceCount: 22, testimonyCount: 8, priority: 'High', description: 'Organized syndicate targeting luxury vehicles on the inter-city highway.', location: 'Inter-State Highway 9 Toll Gate', jurisdictionCode: 'MH-MUM-DIST-01', createdAt: '2026-10-08T14:15:00Z', updatedAt: '2026-10-08T14:15:00Z' },
      { id: 'FIR-2026-004', title: 'Industrial Espionage - TechCorp', status: 'Sealed', type: 'Corporate', date: 'Sep 25, 2026', officer: 'Chief Inv. M. Singh', evidenceCount: 31, testimonyCount: 12, priority: 'Critical', description: 'Theft of proprietary AI algorithms by a former employee.', location: 'Tech Park Cyber City', jurisdictionCode: 'MH-MUM-DIST-03', createdAt: '2026-09-25T09:00:00Z', updatedAt: '2026-09-25T09:00:00Z' },
      { id: 'FIR-2026-005', title: 'State vs. Unknown (Warehouse Arson)', status: 'Cold Case', type: 'Arson', date: 'Aug 14, 2026', officer: 'Inspector S. Patel', evidenceCount: 5, testimonyCount: 1, priority: 'Low', description: 'Fire at abandoned warehouse. Lack of leads and surveillance footage.', location: 'Dockyard Industrial Zone', jurisdictionCode: 'MH-MUM-DIST-02', createdAt: '2026-08-14T16:45:00Z', updatedAt: '2026-08-14T16:45:00Z' },
      { id: 'FIR-2026-006', title: 'Counterfeit Currency Operation', status: 'Active', type: 'Forgery', date: 'Oct 14, 2026', officer: 'Officer R. Kulkarni', evidenceCount: 19, testimonyCount: 4, priority: 'High', description: 'Distribution of fake currency notes in local markets.', location: 'Central Bazaar Market', jurisdictionCode: 'MH-MUM-DIST-01', createdAt: '2026-10-14T08:20:00Z', updatedAt: '2026-10-14T08:20:00Z' }
    ];
    defaultCases.forEach(c => this.cases.set(c.id, c));

    // Default Evidence
    const defaultEvidence: EvidenceRecord[] = [
      { id: 'EV-8821', caseId: 'FIR-2026-001', title: 'CCTV Footage - Main Server Room', type: 'Video', date: 'Oct 12, 2026 14:30', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: 'Sealed', custodian: 'Officer R. Kulkarni', incidentLocation: 'Sector 4 Municipal Data Center', confidentialityLevel: 'Top Secret', createdAt: '2026-10-12T14:30:00Z' },
      { id: 'EV-8822', caseId: 'FIR-2026-001', title: 'Server Access Logs (Encrypted)', type: 'Document', date: 'Oct 12, 2026 15:45', hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', status: 'Sealed', custodian: 'Officer R. Kulkarni', incidentLocation: 'Sector 4 Municipal Data Center', confidentialityLevel: 'Restricted', createdAt: '2026-10-12T15:45:00Z' },
      { id: 'EV-8823', caseId: 'FIR-2026-001', title: 'Tampered Network Switch', type: 'Photo', date: 'Oct 13, 2026 09:15', hash: '4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5', status: 'Pending Chain Transfer', custodian: 'Forensics Specialist A. Roy', incidentLocation: 'Sector 4 Server Rack 12', confidentialityLevel: 'Restricted', createdAt: '2026-10-13T09:15:00Z' },
      { id: 'EV-8824', caseId: 'FIR-2026-002', title: 'Forged Land Ownership Deed', type: 'Document', date: 'Oct 10, 2026 11:00', hash: '7c9e0134b2f159a4c803328e93214f09a13b4c1023948576d123450987654321', status: 'Verified', custodian: 'Inspector S. Patel', incidentLocation: 'Bandra Sub-Registry Office', confidentialityLevel: 'Confidential', createdAt: '2026-10-10T11:00:00Z' }
    ];
    defaultEvidence.forEach(e => this.evidence.set(e.id, e));

    // Default Consensus Requests
    this.consensusRequests = [
      {
        id: 'REQ-2026-901',
        caseId: 'FIR-2026-001',
        caseTitle: 'State vs. Unknown (Sector 4 Cyber Heist)',
        exhibitId: 'EV-8821',
        exhibitTitle: 'CCTV Footage - Main Server Room',
        submittedBy: 'Officer R. Kulkarni',
        requiredVotes: 3,
        currentVotes: 2,
        status: 'Pending',
        votes: [
          { validatorId: 'val_01', validatorName: 'Judge V. Sharma', vote: 'APPROVE', timestamp: '2026-10-12T16:00:00Z', note: 'Hash match verified on chain.' },
          { validatorId: 'val_02', validatorName: 'Validator Dr. S. Rao', vote: 'APPROVE', timestamp: '2026-10-12T16:30:00Z', note: 'Hardware WebAuthn key validated.' }
        ],
        createdAt: '2026-10-12T15:00:00Z'
      },
      {
        id: 'REQ-2026-902',
        caseId: 'FIR-2026-002',
        caseTitle: 'State vs. Deshmukh (Property Fraud)',
        exhibitId: 'EV-8824',
        exhibitTitle: 'Forged Land Ownership Deed',
        submittedBy: 'Inspector S. Patel',
        requiredVotes: 3,
        currentVotes: 3,
        status: 'Approved',
        votes: [
          { validatorId: 'val_01', validatorName: 'Judge V. Sharma', vote: 'APPROVE', timestamp: '2026-10-10T12:00:00Z' },
          { validatorId: 'val_02', validatorName: 'Validator Dr. S. Rao', vote: 'APPROVE', timestamp: '2026-10-10T12:15:00Z' },
          { validatorId: 'val_03', validatorName: 'Advocate M. Mehta', vote: 'APPROVE', timestamp: '2026-10-10T12:30:00Z' }
        ],
        createdAt: '2026-10-10T11:30:00Z'
      }
    ];

    // Default Forgery Reviews
    this.forgeryReviews = [
      {
        id: 'FORG-8801',
        exhibitId: 'EV-8823',
        caseId: 'FIR-2026-001',
        title: 'Tampered Network Switch Photograph',
        type: 'Image File',
        submittedBy: 'Forensics Specialist A. Roy',
        timestamp: '2026-10-13 09:30',
        spectralScore: 88.4,
        metadataIntegrityScore: 42.1,
        perceptualDiffScore: 79.8,
        aiConfidence: 94.2,
        flagReason: 'EXIF Timestamp anomaly & non-contiguous pixel quantization detected in high-contrast regions.',
        status: 'Under Review'
      },
      {
        id: 'FORG-8802',
        exhibitId: 'EV-8824',
        caseId: 'FIR-2026-002',
        title: 'Land Ownership Deed PDF',
        type: 'PDF Document',
        submittedBy: 'Inspector S. Patel',
        timestamp: '2026-10-10 11:15',
        spectralScore: 92.0,
        metadataIntegrityScore: 98.5,
        perceptualDiffScore: 12.3,
        aiConfidence: 99.1,
        flagReason: 'Seal signature font vector mismatch against state archive baseline.',
        status: 'Quarantined'
      }
    ];

    // Default Identity Unlocks
    this.identityUnlocks = [
      {
        id: 'UNLOCK-001',
        caseId: 'FIR-2026-004',
        caseTitle: 'Industrial Espionage - TechCorp',
        witnessAlias: 'Whistleblower Alpha',
        requestor: 'Prosecutor R. Sen',
        reason: 'Judicial order issued for in-camera cross-examination during trial proceedings.',
        thresholdRequired: 4,
        thresholdGranted: 2,
        status: 'Pending',
        grantedBy: ['Judge V. Sharma', 'Chief Justice M. Kapoor'],
        createdAt: '2026-09-28T14:00:00Z'
      }
    ];

    // Default Precedent Flags
    this.precedentFlags = [
      {
        id: 'PREC-701',
        caseId: 'FIR-2026-001',
        caseTitle: 'State vs. Unknown (Sector 4 Cyber Heist)',
        precedentCitation: 'AIR 2021 SC 1420 (Electronic Evidence Admissibility under Sec 65B)',
        conflictDescription: 'Secondary server log copy submitted without contemporaneous certificate of hash integrity.',
        severity: 'High',
        systemAction: 'Require Section 65B Cryptographic Attestation before Bench Review.',
        status: 'Flagged'
      }
    ];

    // Seed Decoy Honeypot Datasets (Served ONLY during Duress Sessions)
    const defaultDecoyCases: CaseRecord[] = [
      { id: 'FIR-DECOY-8801', title: 'State vs. Cyber Transport Syndicate (Decoy Docket)', status: 'Active', type: 'Cyber Crime', date: 'Oct 14, 2026', officer: 'Officer R. Kulkarni', evidenceCount: 6, testimonyCount: 2, priority: 'High', description: 'Simulated traffic monitoring log analysis for Western precinct routing.', location: 'Western Suburb Precinct 9', jurisdictionCode: 'MH-MUM-DIST-01', createdAt: '2026-10-14T10:00:00Z', updatedAt: '2026-10-14T10:00:00Z' },
      { id: 'FIR-DECOY-8802', title: 'Deshmukh Land Registry Audit (Decoy File)', status: 'Pending Review', type: 'Financial', date: 'Oct 11, 2026', officer: 'Inspector S. Patel', evidenceCount: 4, testimonyCount: 1, priority: 'Medium', description: 'Deed register verification for Municipal Ward 42.', location: 'Sub-Registry Ward 42', jurisdictionCode: 'MH-MUM-DIST-02', createdAt: '2026-10-11T11:30:00Z', updatedAt: '2026-10-11T11:30:00Z' }
    ];
    defaultDecoyCases.forEach(c => this.decoyCases.set(c.id, c));

    const defaultDecoyEvidence: EvidenceRecord[] = [
      { id: 'EV-DECOY-9901', caseId: 'FIR-DECOY-8801', title: 'Traffic Packet Capture Log (Honeytoken)', type: 'Document', date: 'Oct 14, 2026 11:00', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: 'Sealed', custodian: 'Officer R. Kulkarni', incidentLocation: 'Western Suburb Precinct 9', confidentialityLevel: 'Restricted', createdAt: '2026-10-14T11:00:00Z' }
    ];
    defaultDecoyEvidence.forEach(e => this.decoyEvidence.set(e.id, e));

    this.decoyConsensusRequests = [
      {
        id: 'REQ-DECOY-901',
        caseId: 'FIR-DECOY-8801',
        caseTitle: 'State vs. Cyber Transport Syndicate (Decoy Docket)',
        exhibitId: 'EV-DECOY-9901',
        exhibitTitle: 'Traffic Packet Capture Log (Honeytoken)',
        submittedBy: 'Officer R. Kulkarni',
        requiredVotes: 3,
        currentVotes: 1,
        status: 'Pending',
        votes: [
          { validatorId: 'val_01', validatorName: 'Judge V. Sharma', vote: 'APPROVE', timestamp: '2026-10-14T12:00:00Z', note: 'Decoy Hash verified.' }
        ],
        createdAt: '2026-10-14T11:30:00Z'
      }
    ];

    this.decoyForgeryReviews = [
      {
        id: 'FORG-DECOY-801',
        exhibitId: 'EV-DECOY-9901',
        caseId: 'FIR-DECOY-8801',
        title: 'Traffic Packet Capture Log (Honeytoken)',
        type: 'Document File',
        submittedBy: 'Forensics Specialist A. Roy',
        timestamp: '2026-10-14 11:30',
        spectralScore: 91.2,
        metadataIntegrityScore: 89.5,
        perceptualDiffScore: 14.1,
        aiConfidence: 98.4,
        flagReason: 'Honeytoken digital marker verified clean baseline.',
        status: 'Under Review'
      }
    ];
  }

  private async loadFromFirestore() {
    const db = getFirestore();
    if (!db) return;
    try {
      const usersSnap = await db.collection('users').get();
      usersSnap.forEach((doc: any) => {
        const u = doc.data() as UserRecord;
        this.users.set(u.id, u);
        this.usersByEmail.set(u.email.toLowerCase(), u);
      });

      const duressSnap = await db.collection('duress_alerts').orderBy('timestamp', 'desc').get();
      const loadedAlerts: DuressAlert[] = [];
      duressSnap.forEach((doc: any) => loadedAlerts.push(doc.data() as DuressAlert));
      if (loadedAlerts.length > 0) this.duressAlerts = loadedAlerts;

      const vettingSnap = await db.collection('vetting_queue').get();
      const loadedVetting: Array<{ id: string; userId: string; submittedAt: string; consentGiven: boolean }> = [];
      vettingSnap.forEach((doc: any) => loadedVetting.push(doc.data() as any));
      if (loadedVetting.length > 0) this.vettingQueue = loadedVetting;
      
      console.log('🔥 Synced data from Firebase Firestore');
    } catch (err: any) {
      console.log('ℹ️  Firestore DB API status:', err.message || err);
      console.log('ℹ️  Operating with high-performance local store fallback.');
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
        if (data.cases && Array.isArray(data.cases)) {
          data.cases.forEach((c: CaseRecord) => this.cases.set(c.id, c));
        }
        if (data.evidence && Array.isArray(data.evidence)) {
          data.evidence.forEach((e: EvidenceRecord) => this.evidence.set(e.id, e));
        }
        if (data.consensusRequests && Array.isArray(data.consensusRequests)) {
          this.consensusRequests = data.consensusRequests;
        }
        if (data.forgeryReviews && Array.isArray(data.forgeryReviews)) {
          this.forgeryReviews = data.forgeryReviews;
        }
        if (data.identityUnlocks && Array.isArray(data.identityUnlocks)) {
          this.identityUnlocks = data.identityUnlocks;
        }
        if (data.precedentFlags && Array.isArray(data.precedentFlags)) {
          this.precedentFlags = data.precedentFlags;
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
        vettingQueue: this.vettingQueue,
        cases: Array.from(this.cases.values()),
        evidence: Array.from(this.evidence.values()),
        consensusRequests: this.consensusRequests,
        forgeryReviews: this.forgeryReviews,
        identityUnlocks: this.identityUnlocks,
        precedentFlags: this.precedentFlags
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
    try {
      const db = getFirestore();
      if (db) {
        db.collection('users').doc(user.id).set(user, { merge: true }).catch((err: any) => console.log('Firestore save user status:', err.message || err));
      }
    } catch (e: any) {
      console.log('Firestore write info:', e.message || e);
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
      locationInfo: alert.locationInfo || { lat: 19.0760, lng: 72.8777, jurisdiction: 'MH-MUM-DIST-01' },
      id: `alert_dur_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      status: 'UNACKNOWLEDGED'
    };
    this.duressAlerts.unshift(record);
    this.persistToDisk();

    try {
      const db = getFirestore();
      if (db) {
        db.collection('duress_alerts').doc(record.id).set(record).catch((err: any) => console.log('Firestore alert status:', err.message || err));
      }
    } catch (e: any) {
      console.log('Firestore write info:', e.message || e);
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

    try {
      const db = getFirestore();
      if (db) {
        db.collection('vetting_queue').doc(item.id).set(item).catch((err: any) => console.log('Firestore vetting status:', err.message || err));
      }
    } catch (e: any) {
      console.log('Firestore write info:', e.message || e);
    }

    return item;
  }

  public getVettingQueue() {
    return [...this.vettingQueue];
  }

  // --- CASES API ---
  public getCases(isDuressSession?: boolean): CaseRecord[] {
    if (isDuressSession) {
      return Array.from(this.decoyCases.values());
    }
    return Array.from(this.cases.values());
  }

  public getCaseById(id: string, isDuressSession?: boolean): CaseRecord | undefined {
    if (isDuressSession) {
      return this.decoyCases.get(id);
    }
    return this.cases.get(id);
  }

  public saveCase(caseItem: CaseRecord): CaseRecord {
    caseItem.updatedAt = new Date().toISOString();
    this.cases.set(caseItem.id, caseItem);
    this.persistToDisk();
    return caseItem;
  }

  // --- EVIDENCE API ---
  public getEvidence(caseId?: string, isDuressSession?: boolean): EvidenceRecord[] {
    const targetMap = isDuressSession ? this.decoyEvidence : this.evidence;
    const all = Array.from(targetMap.values());
    if (caseId) {
      return all.filter(e => e.caseId === caseId);
    }
    return all;
  }

  public getEvidenceById(id: string): EvidenceRecord | undefined {
    return this.evidence.get(id);
  }

  public saveEvidence(item: EvidenceRecord): EvidenceRecord {
    this.evidence.set(item.id, item);
    // Increment case evidence count if case exists
    const c = this.cases.get(item.caseId);
    if (c) {
      c.evidenceCount += 1;
      c.updatedAt = new Date().toISOString();
      this.cases.set(c.id, c);
    }
    this.persistToDisk();
    return item;
  }

  // --- CONSENSUS APPROVALS ---
  public getConsensusRequests(isDuressSession?: boolean): ConsensusRequest[] {
    if (isDuressSession) {
      return [...this.decoyConsensusRequests];
    }
    return [...this.consensusRequests];
  }

  public addConsensusVote(requestId: string, validatorId: string, validatorName: string, vote: 'APPROVE' | 'REJECT' | 'FLAG_FORGERY', note?: string): ConsensusRequest | undefined {
    const req = this.consensusRequests.find(r => r.id === requestId);
    if (!req) return undefined;
    
    // Check if already voted
    const existing = req.votes.find(v => v.validatorId === validatorId);
    if (!existing) {
      req.votes.push({
        validatorId,
        validatorName,
        vote,
        timestamp: new Date().toISOString(),
        note
      });
      req.currentVotes = req.votes.length;
      if (req.currentVotes >= req.requiredVotes) {
        req.status = 'Approved';
      }
      this.persistToDisk();
    }
    return req;
  }

  // --- FORGERY REVIEWS ---
  public getForgeryReviews(isDuressSession?: boolean): ForgeryReviewItem[] {
    if (isDuressSession) {
      return [...this.decoyForgeryReviews];
    }
    return [...this.forgeryReviews];
  }

  public decideForgery(reviewId: string, decision: 'Quarantined' | 'Cleared' | 'Escalated to Bench', notes?: string): ForgeryReviewItem | undefined {
    const item = this.forgeryReviews.find(f => f.id === reviewId);
    if (!item) return undefined;
    item.status = decision;
    if (notes) item.notes = notes;
    this.persistToDisk();
    return item;
  }

  // --- IDENTITY UNLOCKS ---
  public getIdentityUnlocks(): IdentityUnlockRequest[] {
    return [...this.identityUnlocks];
  }

  public approveIdentityUnlock(unlockId: string, grantedByUserName: string): IdentityUnlockRequest | undefined {
    const req = this.identityUnlocks.find(u => u.id === unlockId);
    if (!req) return undefined;
    if (!req.grantedBy.includes(grantedByUserName)) {
      req.grantedBy.push(grantedByUserName);
      req.thresholdGranted = req.grantedBy.length;
      if (req.thresholdGranted >= req.thresholdRequired) {
        req.status = 'Approved';
      }
      this.persistToDisk();
    }
    return req;
  }

  // --- PRECEDENT FLAGS ---
  public getPrecedentFlags(): PrecedentFlagItem[] {
    return [...this.precedentFlags];
  }

  public resolvePrecedentFlag(flagId: string, resolvedBy: string): PrecedentFlagItem | undefined {
    const flag = this.precedentFlags.find(p => p.id === flagId);
    if (!flag) return undefined;
    flag.status = 'Resolved';
    flag.resolvedBy = resolvedBy;
    flag.resolvedAt = new Date().toISOString();
    this.persistToDisk();
    return flag;
  }
}

export const primaryStore = new PrimaryDataStore();
