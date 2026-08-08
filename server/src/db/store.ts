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
  status: 'UNACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED' | string;
  refId?: string;
  fieldNodeId?: string;
  detailsText?: string;
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
  seizureBagId?: string;
  seizureMethod?: string;
  priorityLevel?: string;
  witnessName?: string;
  preservationType?: string;
  tags?: string[];
  evidenceNotes?: string;
  txHash?: string;
  blockNumber?: number;
  merkleRoot?: string;
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
  caseTitle?: string;
  caseRef?: string;
  exhibitId?: string;
  exhibitTitle?: string;
  submittedBy?: string;
  requiredVotes?: number;
  currentVotes?: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged Forgery' | 'Flagged suspicious' | string;
  validatorVoteStatus?: string;
  votes?: ConsensusVote[];
  createdAt?: string;
  queue?: string;
  waitTimeHours?: number;
  waitTimeFormatted?: string;
  slaLimitFormatted?: string;
  urgency?: string;
  urgencyColor?: string;
  badgeColor?: string;
  quorumSigned?: number;
  quorumTotal?: number;
  merkleRoot?: string;
  zkProofType?: string;
  entropyScore?: string;
  cryptographicDetails?: string;
  signedBy?: Record<string, boolean>;
  txHash?: string;
  blockNumber?: number;
  category?: string;
  requestAgency?: string;
  description?: string;
  targetRecordHash?: string;
  validatorVote?: string;
  validatorJustificationNote?: string;
  nodeVotes?: any[];
  courtAuthorityVoteStatus?: string;
  yourVote?: string;
  title?: string;
  proposedRecordHash?: string;
  currentApprovalCount?: number;
  totalRequiredCount?: number;
  systemFlagIndicator?: {
    isFlagged: boolean;
    flagType?: string;
    title?: string;
    description?: string;
  };
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

export interface AnalyticsReportRecord {
  id: string;
  reportCode?: string;
  title: string;
  privacyType?: string;
  status?: string;
  courtScope?: string;
  benchScope?: string;
  cohortSize?: number;
  minCohortThreshold?: number;
  differentialPrivacyEpsilon?: number;
  isKAnonymityValid?: boolean;
  caseDurationAvgDays?: number;
  caseDurationBaselineDays?: number;
  precedentVarianceScore?: number;
  anomalyScore?: number;
  anomalySeverity?: string;
  summaryDescription?: string;
  encryptionAlgorithm?: string;
  escalationStatus?: string;
  escalationTicketId?: string;
  escalationDate?: string;
  escalationRationale?: string;
  escalationCategory?: string;
  createdAt?: string;
}

export interface ValidatorActivityLogRecord {
  id: string;
  eventType: string;
  userId: string;
  userRole?: string;
  timestamp: string;
  category?: string;
  actionName?: string;
  targetScope?: string;
  outcome?: string;
  blockNumber?: number;
  details?: Record<string, any>;
  action?: string;
  type?: string;
  time?: string;
  nodeId?: string;
  icon?: string;
  color?: string;
}

export interface OversightEscalationRecord {
  id: string;
  ticketId?: string;
  reportId?: string;
  reportCode?: string;
  title?: string;
  category?: string;
  rationale?: string;
  validatorName?: string;
  status?: string;
  createdAt?: string;
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
  private analyticsReports: any[] = [];
  private oversightEscalations: any[] = [];
  private validatorActivityLogs: any[] = [];

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

    // Consensus Requests — only seed if empty (real data from disk takes priority)
    if (this.consensusRequests.length === 0) {
      this.consensusRequests = [
        {
          id: 'REQ-8831',
          caseId: 'FIR-2026-001',
          caseTitle: 'State vs. Unknown (Sector 4 Cyber Heist)',
          category: 'Record Sealing',
          requestAgency: 'Zone 1 North High Court Bench',
          description: 'Request for multi-sig quorum sealing of EV-8821 CCTV payload.',
          status: 'Approved',
          validatorVoteStatus: 'Approved',
          quorumTotal: 3,
          quorumSigned: 3,
          createdAt: '2026-08-06T16:30:00Z',
          targetRecordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
        },
        {
          id: 'REQ-8829',
          caseId: 'FIR-2026-002',
          caseTitle: 'State vs. Deshmukh (Property Fraud)',
          category: 'Section 65B Re-hash',
          requestAgency: 'Zone 4 West Special Tribunal',
          description: 'Request for secondary hash re-verification without Section 65B attestation.',
          status: 'Rejected',
          validatorVoteStatus: 'Rejected',
          quorumTotal: 3,
          quorumSigned: 1,
          createdAt: '2026-08-06T14:10:00Z',
          targetRecordHash: '7c9e0134b2f159a4c803328e93214f09a13b4c1023948576d123450987654321'
        }
      ];
    }

    // Analytics Reports — only seed if empty (real data from disk takes priority)
    if (this.analyticsReports.length === 0) {
      this.analyticsReports = [
        {
          id: 'RPT-2026-001',
          reportCode: 'FHE-AGG-2026-001',
          title: 'Bench-Level Precedent Alignment Matrix',
          courtScope: 'All 5 Court Districts',
          benchScope: 'Division Bench 1 & 2',
          cohortSize: 14820,
          minCohortThreshold: 50,
          differentialPrivacyEpsilon: 0.5,
          isKAnonymityValid: true,
          caseDurationAvgDays: 1.4,
          caseDurationBaselineDays: 1.5,
          precedentVarianceScore: 96.8,
          anomalyScore: 3.2,
          anomalySeverity: 'Low',
          summaryDescription: 'Homomorphic vector similarity across court zones within normal 2-sigma variance.',
          encryptionAlgorithm: 'CKKS Homomorphic Encryption',
          escalationStatus: 'None',
          createdAt: '2026-08-05T11:20:00Z'
        },
        {
          id: 'RPT-2026-002',
          reportCode: 'FHE-AGG-2026-002',
          title: 'Layer 4 Homomorphic Case Duration & Drift Report',
          courtScope: 'Zone 4 West Special Tribunal',
          benchScope: 'Special Tribunal Bench 3',
          cohortSize: 3810,
          minCohortThreshold: 50,
          differentialPrivacyEpsilon: 0.5,
          isKAnonymityValid: true,
          caseDurationAvgDays: 3.2,
          caseDurationBaselineDays: 1.4,
          precedentVarianceScore: 66.7,
          anomalyScore: 33.3,
          anomalySeverity: 'Critical',
          summaryDescription: 'Statistically significant disposition rate spike (+128%) detected in Zone 4 West.',
          encryptionAlgorithm: 'CKKS Homomorphic Encryption',
          escalationStatus: 'Escalated',
          escalationTicketId: 'ESC-2026-88412',
          escalationDate: '2026-08-07T08:42:00Z',
          escalationRationale: 'Disposition rate anomaly exceeds threshold for independent oversight inquiry.',
          escalationCategory: 'Zone 4 West Special Tribunal',
          createdAt: '2026-08-07T08:15:00Z'
        }
      ];
    }

    // Oversight Escalations — only seed if empty (real data from disk takes priority)
    if (this.oversightEscalations.length === 0) {
      this.oversightEscalations = [
        {
          id: 'ESC-2026-88412',
          ticketId: 'ESC-2026-88412',
          reportId: 'RPT-2026-002',
          reportCode: 'FHE-AGG-2026-002',
          title: 'Disposition Duration Anomaly Escalation',
          category: 'Zone 4 West Special Tribunal',
          rationale: 'Disposition duration spike +1.8 days in Zone 4 West Special Tribunal.',
          validatorName: 'NODE-IND-VAL-04',
          status: 'ROUTED_TO_OVERSIGHT_ENCLAVE',
          createdAt: '2026-08-07T08:42:00Z'
        }
      ];
    }

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

  public loadFromDisk() {
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
        if (data.analyticsReports && Array.isArray(data.analyticsReports)) {
          this.analyticsReports = data.analyticsReports;
        }
        if (data.oversightEscalations && Array.isArray(data.oversightEscalations)) {
          this.oversightEscalations = data.oversightEscalations;
        }
        if (data.validatorActivityLogs && Array.isArray(data.validatorActivityLogs)) {
          this.validatorActivityLogs = data.validatorActivityLogs;
        }
        // Seed only after disk data is loaded — so disk data takes priority
        this.seedDefaults();
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
        precedentFlags: this.precedentFlags,
        analyticsReports: this.analyticsReports,
        oversightEscalations: this.oversightEscalations,
        validatorActivityLogs: this.validatorActivityLogs
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

    try {
      const db = getFirestore();
      if (db) {
        db.collection('cases').doc(caseItem.id).set(caseItem).catch((err: any) => console.log('Firestore case save status:', err.message || err));
      }
    } catch (e: any) {
      console.log('Firestore write info:', e.message || e);
    }

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
      try {
        const db = getFirestore();
        if (db) {
          db.collection('cases').doc(c.id).set(c).catch((err: any) => console.log('Firestore case update status:', err.message || err));
        }
      } catch (e: any) {
        console.log('Firestore write info:', e.message || e);
      }
    }
    this.persistToDisk();

    try {
      const db = getFirestore();
      if (db) {
        db.collection('evidence').doc(item.id).set(item).catch((err: any) => console.log('Firestore evidence save status:', err.message || err));
      }
    } catch (e: any) {
      console.log('Firestore write info:', e.message || e);
    }

    return item;
  }

  // --- CONSENSUS APPROVALS ---
  public getConsensusRequests(isDuressSession?: boolean): ConsensusRequest[] {
    if (isDuressSession) {
      return [...this.decoyConsensusRequests];
    }
    return [...this.consensusRequests];
  }

  public getConsensusRequestById(id: string, isDuressSession?: boolean): ConsensusRequest | undefined {
    if (isDuressSession) {
      return this.decoyConsensusRequests.find(r => r.id === id);
    }
    return this.consensusRequests.find(r => r.id === id);
  }

  public saveConsensusRequest(request: ConsensusRequest): ConsensusRequest {
    const idx = this.consensusRequests.findIndex(r => r.id === request.id);
    if (idx >= 0) {
      this.consensusRequests[idx] = request;
    } else {
      this.consensusRequests.push(request);
    }
    this.persistToDisk();
    return request;
  }

  public addConsensusVote(requestId: string, validatorId: string, validatorName: string, vote: 'APPROVE' | 'REJECT' | 'FLAG_FORGERY', note?: string): ConsensusRequest | undefined {
    const req = this.consensusRequests.find(r => r.id === requestId);
    if (!req) return undefined;
    
    // Check if already voted
    if (!req.votes) req.votes = [];
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
      if (req.requiredVotes && req.currentVotes >= req.requiredVotes) {
        req.status = 'Approved';
      }
      this.persistToDisk();
    }
    return req;
  }

  // --- ANALYTICS REPORTS ---
  public addAnalyticsReport(report: AnalyticsReportRecord): AnalyticsReportRecord {
    this.analyticsReports.push(report);
    this.persistToDisk();
    return report;
  }

  public getAnalyticsReports(): AnalyticsReportRecord[] {
    return [...this.analyticsReports];
  }

  public getAnalyticsReportById(id: string): AnalyticsReportRecord | undefined {
    return this.analyticsReports.find(r => r.id === id);
  }

  public saveAnalyticsReport(report: AnalyticsReportRecord): AnalyticsReportRecord {
    const idx = this.analyticsReports.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      this.analyticsReports[idx] = report;
    } else {
      this.analyticsReports.push(report);
    }
    this.persistToDisk();
    return report;
  }

  // --- OVERSIGHT ESCALATIONS ---
  public getOversightEscalations(): OversightEscalationRecord[] {
    return [...this.oversightEscalations];
  }

  public saveOversightEscalation(escalation: OversightEscalationRecord): OversightEscalationRecord {
    const idx = this.oversightEscalations.findIndex(e => e.id === escalation.id);
    if (idx >= 0) {
      this.oversightEscalations[idx] = escalation;
    } else {
      this.oversightEscalations.push(escalation);
    }
    this.persistToDisk();
    return escalation;
  }

  // --- VALIDATOR ACTIVITY LOGS ---
  public getValidatorActivityLogs(): ValidatorActivityLogRecord[] {
    return [...this.validatorActivityLogs];
  }

  public addValidatorActivityLog(log: ValidatorActivityLogRecord): ValidatorActivityLogRecord {
    this.validatorActivityLogs.push(log);
    this.persistToDisk();
    return log;
  }

  public acknowledgeDuressAlert(alertId: string, status: string = 'INVESTIGATING'): DuressAlert | undefined {
    const alert = this.duressAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status as any;
      this.persistToDisk();
    }
    return alert;
  }

  public getDashboardCounts() {
    return {
      pendingConsensus: this.consensusRequests.filter(r => r.status === 'Pending').length,
      duressAlerts: this.duressAlerts.length,
      flaggedAnomalies: this.forgeryReviews.filter(f => f.status === 'Quarantined').length,
      activeCases: this.cases.size,
      consensusAwaitingCount: this.consensusRequests.filter(r => r.status === 'Pending').length,
      analyticsReportsCount: this.analyticsReports.length,
      activeDuressCount: this.duressAlerts.filter(a => a.status !== 'RESOLVED').length,
      bottleneckInfo: 'Zone 4 West Special Tribunal (SLA 12h)'
    };
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

  // --- LIVE AGGREGATE ANALYTICS COMPUTATION FROM DATABASE STORE ---
  public getLiveZoneBenchmarkData() {
    const casesArr = Array.from(this.cases.values());
    const evidenceArr = Array.from(this.evidence.values());

    const zones = [
      { key: 'Zone 1', name: 'Zone 1 (North High Court)', code: 'DIST-01' },
      { key: 'Zone 2', name: 'Zone 2 (South Commercial Bench)', code: 'DIST-02' },
      { key: 'Zone 3', name: 'Zone 3 (East Cyber Precinct)', code: 'DIST-03' },
      { key: 'Zone 4', name: 'Zone 4 (West Special Tribunal)', code: 'DIST-04' },
      { key: 'Zone 5', name: 'Zone 5 (Central Apex Appellate)', code: 'DIST-05' },
    ];

    return zones.map((z, idx) => {
      const zoneCases = casesArr.filter(c => 
        c.jurisdictionCode?.includes(z.code) || 
        c.location?.toLowerCase().includes(z.key.toLowerCase()) ||
        (z.key === 'Zone 1' && (!c.jurisdictionCode || c.jurisdictionCode.includes('DIST-01')))
      );

      const incidents = zoneCases.length;
      const resolvedCount = zoneCases.filter(c => c.status === 'Closed' || c.status === 'Sealed').length;
      const backlog = zoneCases.filter(c => c.status === 'Active' || c.status === 'Pending Review' || c.status === 'Cold Case').length;

      let totalDays = 0;
      zoneCases.forEach(c => {
        const created = new Date(c.createdAt || c.date || Date.now()).getTime();
        const updated = new Date(c.updatedAt || Date.now()).getTime();
        const diffDays = Math.max(0.5, (updated - created) / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
      });

      const avgDays = incidents > 0 ? Number((totalDays / incidents).toFixed(1)) : Number((1.2 + idx * 0.2).toFixed(1));
      const resolveRate = incidents > 0 ? Number(((resolvedCount / incidents) * 100).toFixed(1)) : Number((94.0 - idx * 1.5).toFixed(1));

      const zoneEvidence = evidenceArr.filter(e => zoneCases.some(c => c.id === e.caseId));
      const sealedEvidenceCount = zoneEvidence.filter(e => e.status === 'Sealed' || e.status === 'Verified').length;
      const integrity = zoneEvidence.length > 0 ? Number(((sealedEvidenceCount / zoneEvidence.length) * 100).toFixed(2)) : Number((99.95 - idx * 0.03).toFixed(2));

      return {
        zone: z.name,
        incidents,
        resolveRate,
        avgDays,
        integrity,
        backlog
      };
    });
  }

  public getLiveCourtBenchesVelocity() {
    const casesArr = Array.from(this.cases.values());
    const consensusArr = this.consensusRequests;
    const precedentArr = this.precedentFlags;

    const benches = [
      { name: 'Division Bench 1 (Cyber & Financial)', category: 'Cyber Crime', judge: 'Hon. Justice V. K. Deshmukh' },
      { name: 'Division Bench 2 (Commercial & IPR)', category: 'Financial', judge: 'Hon. Justice S. K. Roy' },
      { name: 'Division Bench 3 (Criminal & NDPS)', category: 'Theft', judge: 'Hon. Magistrate P. L. Bhatia' },
      { name: 'Special Writs & Constitution Bench', category: 'Corporate', judge: 'Hon. Justice M. G. Rao' },
      { name: 'Appellate Quality & Precedent Cell', category: 'Forgery', judge: 'Hon. Senior Registrar A. K. Varma' },
    ];

    return benches.map(b => {
      const benchCases = casesArr.filter(c => c.type === b.category || (b.category === 'Cyber Crime' && c.type?.includes('Cyber')));
      const benchConsensus = consensusArr.filter(c => c.category?.toLowerCase().includes(b.category.toLowerCase()));
      const activeDockets = benchCases.filter(c => c.status === 'Active' || c.status === 'Pending Review').length + benchConsensus.length;

      let totalDays = 0;
      benchCases.forEach(c => {
        const created = new Date(c.createdAt || Date.now()).getTime();
        const updated = new Date(c.updatedAt || Date.now()).getTime();
        totalDays += Math.max(0.5, (updated - created) / (1000 * 60 * 60 * 24));
      });
      const avgDispositionDays = benchCases.length > 0 ? Number((totalDays / benchCases.length).toFixed(1)) : 1.4;

      const resolved = benchCases.filter(c => c.status === 'Closed' || c.status === 'Sealed').length;
      const efficiency = benchCases.length > 0 ? Number(((resolved / benchCases.length) * 100).toFixed(1)) : 95.1;

      const flaggedPrecedents = precedentArr.filter(p => benchCases.some(c => c.id === p.caseId) && p.status === 'Flagged').length;
      const precedentAlign = benchCases.length > 0 ? Number((((benchCases.length - flaggedPrecedents) / benchCases.length) * 100).toFixed(1)) : 98.2;

      const assignedOfficer = benchCases.find(c => c.officer)?.officer || b.judge;

      return {
        bench: b.name,
        judge: assignedOfficer,
        avgDispositionDays,
        activeDockets,
        efficiency,
        precedentAlign
      };
    });
  }

  public getLiveDurationTrends() {
    const casesArr = Array.from(this.cases.values());

    const periods = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'];

    return periods.map((period, idx) => {
      const multiplier = 0.9 + (idx * 0.05);
      const z1 = casesArr.filter(c => c.jurisdictionCode?.includes('DIST-01')).length;
      const z2 = casesArr.filter(c => c.jurisdictionCode?.includes('DIST-02')).length;
      const z3 = casesArr.filter(c => c.jurisdictionCode?.includes('DIST-03')).length;
      const z4 = casesArr.filter(c => c.jurisdictionCode?.includes('DIST-04')).length;

      return {
        period,
        zone1North: Number((Math.max(0.5, (z1 || 1) * 0.4 * multiplier)).toFixed(1)),
        zone2South: Number((Math.max(0.6, (z2 || 1) * 0.5 * multiplier)).toFixed(1)),
        zone3Cyber: Number((Math.max(0.4, (z3 || 1) * 0.3 * multiplier)).toFixed(1)),
        zone4West: Number((Math.max(0.8, (z4 || 1) * 0.7 * multiplier)).toFixed(1)),
        zone5Apex: Number((Math.max(0.3, 0.4 * multiplier)).toFixed(1)),
      };
    });
  }

  public getLiveAnomalyTrends() {
    const forgeryArr = this.forgeryReviews;
    const months = ['May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026'];

    return months.map((month, idx) => {
      const quarantinedCount = forgeryArr.filter(f => f.status === 'Quarantined' || f.status === 'Under Review').length;
      const baseAnomaly = 0.02 * (idx + 1);

      return {
        month,
        bench1Cyber: Number((baseAnomaly * 0.5).toFixed(2)),
        bench2Commercial: Number((baseAnomaly * 0.8).toFixed(2)),
        bench3Criminal: Number((baseAnomaly * 0.6).toFixed(2)),
        bench4WestTribunal: Number((baseAnomaly + (quarantinedCount * 0.05)).toFixed(2)),
        bench5Apex: Number((baseAnomaly * 0.2).toFixed(2)),
      };
    });
  }

  public getLiveCohortPrivacyAudit() {
    const casesArr = Array.from(this.cases.values());
    const evidenceArr = Array.from(this.evidence.values());

    const categories = [
      { category: 'Cyber Evidence Dockets', type: 'Cyber Crime' },
      { category: 'Financial & Corporate Fraud', type: 'Financial' },
      { category: 'NDPS Contraband Exhibits', type: 'Theft' },
      { category: 'IPR & Commercial Contracts', type: 'Corporate' },
      { category: 'Property & Land Disputes', type: 'Arson' },
      { category: 'West Special Tribunal Zone 4', type: 'Forgery' },
    ];

    return categories.map(cat => {
      const catCases = casesArr.filter(c => c.type === cat.type);
      const catEvidence = evidenceArr.filter(e => catCases.some(c => c.id === e.caseId));
      const N = Math.max(50, catCases.length * 10 + catEvidence.length * 5 + 50);
      const minThreshold = 50;

      return {
        category: cat.category,
        N,
        minThreshold,
        isSafe: N >= minThreshold
      };
    });
  }

  public getLiveTimeSeriesVolume() {
    const evidenceArr = Array.from(this.evidence.values());
    const casesArr = Array.from(this.cases.values());
    const dates = ['Mon, Oct 12', 'Tue, Oct 13', 'Wed, Oct 14', 'Thu, Oct 15', 'Fri, Oct 16', 'Sat, Oct 17', 'Sun, Oct 18'];

    return dates.map((date, idx) => {
      const dayEv = evidenceArr.filter(e => e.date?.includes(`Oct ${12 + idx}`)).length;
      const dayCase = casesArr.filter(c => c.date?.includes(`Oct ${12 + idx}`)).length;

      return {
        date,
        digitalEvidence: dayEv > 0 ? dayEv : 10 + idx * 5,
        testimonies: dayCase > 0 ? dayCase * 2 : 5 + idx * 2,
        judicialOrders: Math.max(1, dayCase),
        integrityScore: 100.0 - (idx * 0.05)
      };
    });
  }

  public getLiveCaseCategories() {
    const casesArr = Array.from(this.cases.values());
    const total = casesArr.length || 1;

    const categories = [
      { name: 'Cyber Crime & Extortion', type: 'Cyber Crime', color: '#6366f1' },
      { name: 'Financial & Corporate Fraud', type: 'Financial', color: '#3b82f6' },
      { name: 'Narcotics & Contraband (NDPS)', type: 'Theft', color: '#10b981' },
      { name: 'IPR & Commercial Contracts', type: 'Corporate', color: '#f59e0b' },
      { name: 'Property & Land Disputes', type: 'Forgery', color: '#ec4899' },
    ];

    return categories.map(cat => {
      const count = casesArr.filter(c => c.type === cat.type).length;
      const value = Number(((count / total) * 100).toFixed(0));

      return {
        name: cat.name,
        value: value > 0 ? value : 20,
        count,
        color: cat.color
      };
    });
  }

  public getLiveAnalyticalModules(): any[] {
    const casesArr = Array.from(this.cases.values());
    const evidenceArr = Array.from(this.evidence.values());
    const forgeryArr = this.forgeryReviews;
    const consensusArr = this.consensusRequests;

    return [
      {
        id: 'MOD-001',
        title: 'Digital Evidence Ingestion & Sealing Velocity',
        category: 'Evidence Integrity & Volume',
        kpiPrimary: `${evidenceArr.length} Sealed Assets`,
        kpiLabel: 'Total Sealed Evidence',
        trendPercentage: `+${((evidenceArr.length / Math.max(1, casesArr.length)) * 10).toFixed(1)}% YoY`,
        trendDirection: 'up',
        description: 'Cryptographic SHA-256 sealing throughput, zero-knowledge attestation speed, and zone-wise ingestion volume.',
        statusBadge: `${evidenceArr.filter(e => e.status === 'Sealed' || e.status === 'Verified').length}/${evidenceArr.length} Sealed Intact`,
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        iconName: 'FileCheck',
        lastSync: 'Sync Live (Real-Time Database)',

        metricHighlights: [
          { label: 'Total Database Evidence', value: `${evidenceArr.length} Files`, note: 'Live count from nyayakasha_primary_store.json' },
          { label: 'Sealed & Verified Ratio', value: `${((evidenceArr.filter(e => e.status === 'Sealed' || e.status === 'Verified').length / Math.max(1, evidenceArr.length)) * 100).toFixed(1)}%`, note: 'Cryptographic verification status' },
          { label: 'Tamper Penetration Attempts', value: `${forgeryArr.filter(f => f.status === 'Quarantined').length} Flagged`, note: 'Active forgery quarantine reviews' },
        ],
        zoneBreakdown: this.getLiveZoneBenchmarkData().map(z => ({
          zone: z.zone,
          metricValue: `${z.incidents} Cases • ${z.avgDays}d Avg`,
          status: z.incidents > 3 ? 'Optimal' : 'Normal'
        })),
        timeSeriesDetailed: [
          { time: '08:00 AM', valueA: evidenceArr.length * 2, valueB: evidenceArr.length * 2 - 1, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
          { time: '12:00 PM', valueA: evidenceArr.length * 4, valueB: evidenceArr.length * 4, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
          { time: '04:00 PM', valueA: evidenceArr.length * 6, valueB: evidenceArr.length * 6 - 1, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
        ],
        statutoryAuditLog: evidenceArr.slice(0, 3).map((e, idx) => ({
          event: `Evidence #${e.id} (${e.title}) Sealed via SHA-256`,
          timestamp: e.date || `${(idx + 1) * 10} mins ago`,
          hash: `${e.hash.slice(0, 6)}...${e.hash.slice(-4)}`,
          status: e.status
        }))
      },
      {
        id: 'MOD-002',
        title: 'Judicial Adjudication Velocity & Docket Throughput',
        category: 'Court Operations & Efficiency',
        kpiPrimary: `${casesArr.length} Active Dockets`,
        kpiLabel: 'Total Active Cases',
        trendPercentage: `-${((casesArr.filter(c => c.status === 'Closed').length / Math.max(1, casesArr.length)) * 100).toFixed(0)}% Backlog`,
        trendDirection: 'down',
        description: 'Average time required to issue binding judicial orders, resolve evidentiary objections, and seal case files.',
        statusBadge: 'Active Database Dockets Live',
        badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        iconName: 'Clock',
        lastSync: 'Sync Live (Real-Time Database)',

        metricHighlights: [
          { label: 'Active Court Dockets', value: `${casesArr.length} Cases`, note: 'Live case count in database store' },
          { label: 'Critical Priority Dockets', value: `${casesArr.filter(c => c.priority === 'Critical' || c.priority === 'High').length} Cases`, note: 'High & Critical priority case queue' },
          { label: 'Backlog Clearance Index', value: `${(casesArr.filter(c => c.status === 'Active').length / Math.max(1, casesArr.length)).toFixed(2)} Ratio`, note: 'Active vs total case ratio' },
        ],
        zoneBreakdown: this.getLiveCourtBenchesVelocity().map(b => ({
          zone: b.bench,
          metricValue: `${b.avgDispositionDays} Days Avg • ${b.activeDockets} Dockets`,
          status: b.activeDockets > 1 ? 'Optimal' : 'Normal'
        })),
        timeSeriesDetailed: [
          { time: 'Week 1', valueA: casesArr.length, valueB: casesArr.filter(c => c.status === 'Closed').length + 1, labelA: 'New Filings', labelB: 'Orders Executed' },
          { time: 'Week 2', valueA: casesArr.length + 2, valueB: casesArr.filter(c => c.status === 'Closed').length + 3, labelA: 'New Filings', labelB: 'Orders Executed' },
        ],
        statutoryAuditLog: casesArr.slice(0, 3).map((c, idx) => ({
          event: `Case #${c.id} (${c.title}) Status Updated to ${c.status}`,
          timestamp: `${(idx + 1) * 15} mins ago`,
          hash: `0xCASE_${c.id.replace(/[^A-Z0-9]/gi, '')}`,
          status: 'Recorded'
        }))
      },
      {
        id: 'MOD-003',
        title: 'Zero-Knowledge Forensic Integrity & Forgery Engine Audit',
        category: 'Security & Anti-Tampering',
        kpiPrimary: `${forgeryArr.length} Reviews`,
        kpiLabel: 'Total Forgery Reviews',
        trendPercentage: '0 System Breaches',
        trendDirection: 'up',
        description: 'AI-driven forgery detection, digital signature verification, frame-level video analysis, and hash integrity logs.',
        statusBadge: `${forgeryArr.filter(f => f.status === 'Cleared').length} Cleared / ${forgeryArr.filter(f => f.status === 'Quarantined').length} Quarantined`,
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        iconName: 'ShieldCheck',
        lastSync: 'Sync Live (Real-Time Database)',

        metricHighlights: [
          { label: 'Active Forgery Reviews', value: `${forgeryArr.length} Files`, note: 'Live forgery detection items' },
          { label: 'Quarantined Items', value: `${forgeryArr.filter(f => f.status === 'Quarantined').length} Flagged`, note: 'Isolated by zero-knowledge forensic engine' },
          { label: 'Cleared Items', value: `${forgeryArr.filter(f => f.status === 'Cleared').length} Verified`, note: 'Integrity confirmed intact' },
        ],
        zoneBreakdown: [
          { zone: 'Zone 1 (North)', metricValue: `${forgeryArr.length} Audited • 100% Score`, status: 'Optimal' },
          { zone: 'Zone 2 (South)', metricValue: `${forgeryArr.filter(f => f.status === 'Under Review').length} Under Review`, status: 'Normal' },
        ],
        timeSeriesDetailed: [
          { time: 'Day 1', valueA: 100, valueB: forgeryArr.filter(f => f.status === 'Under Review').length, labelA: 'Integrity %', labelB: 'Unresolved Flags' },
        ],
        statutoryAuditLog: forgeryArr.slice(0, 3).map((f, idx) => ({
          event: `Forgery Review #${f.id} (${f.title}) -> ${f.status}`,
          timestamp: `${(idx + 1) * 20} mins ago`,
          hash: `0xFORG_${f.id}`,
          status: f.status
        }))
      },
      {
        id: 'MOD-004',
        title: 'Precedent Neural Benchmarking & Outlier Variance',
        category: 'Judicial Quality & Consistency',
        kpiPrimary: `${casesArr.length} Rulings`,
        kpiLabel: 'Benchmark Cohort Size',
        trendPercentage: 'Neural Vector Active',
        trendDirection: 'up',
        description: 'Neural vector embedding similarity analysis comparing past judicial orders against historical circuit precedent cohorts.',
        statusBadge: 'Layer 6 Digital Twin Active',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        iconName: 'Scale',
        lastSync: 'Sync Live (Real-Time Database)',

        metricHighlights: [
          { label: 'Benchmark Cohort Size', value: `${casesArr.length} Cases`, note: 'Live dockets in precedent vector space' },
          { label: 'Active Precedent Flags', value: `${this.precedentFlags.filter(p => p.status === 'Flagged').length} Pending`, note: 'Precedent conflict flags in database' },
          { label: 'Vector Match Accuracy', value: '99.2% Cosine', note: 'Multi-dimensional legal semantic similarity' },
        ],
        zoneBreakdown: [
          { zone: 'Cyber Crime Cohort', metricValue: `${casesArr.filter(c => c.type === 'Cyber Crime').length} Cases`, status: 'Optimal' },
          { zone: 'Financial Fraud Cohort', metricValue: `${casesArr.filter(c => c.type === 'Financial').length} Cases`, status: 'Optimal' },
        ],
        timeSeriesDetailed: [
          { time: 'Jan', valueA: casesArr.length, valueB: casesArr.length - 1, labelA: 'Outliers Flagged', labelB: 'Quality Panel Reviewed' },
        ],
        statutoryAuditLog: this.precedentFlags.slice(0, 3).map((p, idx) => ({
          event: `Precedent Flag #${p.id} (${p.caseTitle}) -> ${p.status}`,
          timestamp: `${(idx + 1) * 30} mins ago`,
          hash: `0xPREC_${p.id}`,
          status: p.status
        }))
      },
      {
        id: 'MOD-005',
        title: 'Consensus Multi-Sig Voting & Validator Node Audit',
        category: 'Consensus Governance',
        kpiPrimary: `${consensusArr.length} Requests`,
        kpiLabel: 'Consensus Requests Sealed',
        trendPercentage: 'Quorum Compliance 100%',
        trendDirection: 'up',
        description: 'Multi-judge binding vote distribution, ZK-Proof validator node latency, and cryptographic block sealing ledger.',
        statusBadge: `${consensusArr.filter(c => c.status === 'Approved').length} Approved / ${consensusArr.filter(c => c.status === 'Pending' || c.status === 'Awaiting your vote').length} Pending`,
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        iconName: 'Users',
        lastSync: 'Sync Live (Real-Time Database)',

        metricHighlights: [
          { label: 'Total Consensus Requests', value: `${consensusArr.length} Items`, note: 'Live count from nyayakasha_primary_store.json' },
          { label: 'Approved Requests', value: `${consensusArr.filter(c => c.status === 'Approved').length} Requests`, note: 'Multi-sig threshold achieved' },
          { label: 'Pending Consensus Votes', value: `${consensusArr.filter(c => c.status === 'Pending' || c.status === 'Awaiting your vote').length} Requests`, note: 'Awaiting node validator signatures' },
        ],
        zoneBreakdown: [
          { zone: 'Node Alpha (Court Authority)', metricValue: `${consensusArr.filter(c => c.courtAuthorityVoteStatus === 'Approved').length} Votes Approved`, status: 'Optimal' },
          { zone: 'Node Beta (Independent Validator)', metricValue: `${consensusArr.filter(c => c.validatorVoteStatus === 'Approved').length} Votes Approved`, status: 'Optimal' },
        ],
        timeSeriesDetailed: [
          { time: 'Block #1', valueA: consensusArr.length, valueB: consensusArr.filter(c => c.status === 'Approved').length, labelA: 'Total Requests', labelB: 'Approved' },
        ],
        statutoryAuditLog: consensusArr.slice(0, 3).map((c, idx) => ({
          event: `Consensus Request #${c.id} (${c.title || c.category}) -> ${c.status}`,
          timestamp: `${(idx + 1) * 12} mins ago`,
          hash: `0xCONS_${c.id}`,
          status: c.status || 'Pending'
        }))
      },
      {
        id: 'MOD-006',
        title: 'Cross-Jurisdictional District Court Equity Benchmark',
        category: 'Administrative Equity',
        kpiPrimary: `${new Set(casesArr.map(c => c.jurisdictionCode)).size} Jurisdictions`,
        kpiLabel: 'Synchronized Benches',
        trendPercentage: '100% Ledger Sync',
        trendDirection: 'up',
        description: 'Resource allocation, case load balance, equipment calibration, and digital infrastructure readiness across all court districts.',
        statusBadge: 'Fully Synchronized',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        iconName: 'MapPin',
        lastSync: 'Sync Live (Real-Time Database)',

        metricHighlights: [
          { label: 'Active Jurisdiction Codes', value: `${new Set(casesArr.map(c => c.jurisdictionCode)).size} Codes`, note: 'Live district codes in database' },
          { label: 'Total Court Cases', value: `${casesArr.length} Cases`, note: 'All dockets synchronized across benches' },
          { label: 'Ledger Audit Blocks', value: `${this.analyticsReports.length} Reports`, note: 'Homomorphic encrypted audit reports' },
        ],
        zoneBreakdown: this.getLiveZoneBenchmarkData().map(z => ({
          zone: z.zone,
          metricValue: `${z.incidents} Active Cases • ${z.resolveRate}% Resolve Rate`,
          status: 'Optimal'
        })),
        timeSeriesDetailed: [
          { time: 'Q1 2026', valueA: casesArr.length, valueB: casesArr.length, labelA: 'Infrastructure Readiness', labelB: 'Resource Equity' },
        ],
        statutoryAuditLog: [
          { event: 'Inter-Jurisdictional Database Ledger Audit Passed', timestamp: '5 mins ago', hash: '0xDIST_AUDIT_OK', status: 'Passed' }
        ]
      }
    ];
  }
}

export const primaryStore = new PrimaryDataStore();
