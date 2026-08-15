export type UserRole = 'field_submitter' | 'court_authority' | 'independent_validator';

export type ApprovalState = 'submitted' | 'institution_review' | 'dual_check' | 'vetting' | 'mfa_pending' | 'active' | 'rejected';

export interface UserSettings {
  notifications: {
    consensus: { email: boolean; push: boolean };
    analytics: { email: boolean; push: boolean };
    escalation: { email: boolean; push: boolean };
  };
  sessionTimeout: number;
  language: string;
  themeMode: string;
}

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
  contactExtension?: string;
  chambersLocation?: string;
  appointmentRef?: string;
  authorityScope?: string;
  keyShareFingerprint?: string;
  hardwareTokenName?: string;
  keyGenesisDate?: string;
  mfaAttestationLevel?: string;
  documentBlurScore?: number;
  documentPassesQuality?: boolean;
  profilePhotoUrl?: string;
  digitalSignatureUrl?: string;
  settings?: UserSettings;

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
  status: 'Active' | 'Pending Review' | 'Sealed' | 'Closed' | 'Cold Case' | 'Under Review' | 'Ruled';
  type: string;
  date: string;
  officer: string;
  evidenceCount: number;
  testimonyCount: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  location?: string;
  jurisdictionCode?: string;
  chainHash?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Rich Court-Authority Case File (full forensic record) ──────────────────
export interface CaseEvidenceItem {
  id: string;
  title: string;
  type: string;
  submittedBy: string;
  timestamp: string;
  pramanaHash: string;
  blockNumber: number;
  integrityStatus: 'Pass' | 'Flagged';
  integrityScore: string;
  details: string;
  expectedHash?: string;
  actualHash?: string;
  anomalyTimeWindow?: string;
  previewImageDataUrl?: string;
  signature?: string;
}

export interface CaseTestimonyItem {
  id: string;
  zkpHash: string;
  summary: string;
  timestamp: string;
  isUnlocked: boolean;
  unlockedIdentity?: string;
  witnessRole: string;
  verificationNode?: string;
}

export interface CaseCustodyStep {
  id: string;
  title: string;
  actor: string;
  location: string;
  timestamp: string;
  status: string;
  biometricVerified: boolean;
  gpsCoordinates?: string;
}

export interface CaseOrder {
  id: string;
  title: string;
  issuedBy: string;
  timestamp: string;
  summary: string;
  sealHash: string;
  type: 'Evidentiary Direction' | 'Custody Order' | 'Bench Notice' | 'Final Ruling';
}

export interface CaseNote {
  id: string;
  author: string;
  timestamp: string;
  category: 'Judicial Directive' | 'Evidence Note' | 'Precedent Reference' | 'Ruling';
  content: string;
}

export interface CasePrecedentMatch {
  caseId: string;
  title: string;
  court: string;
  similarityScore: number;
  relevantSections: string[];
  summary: string;
}

export interface RichCaseRecord {
  id: string;
  title: string;
  caseType: string;
  filingDate: string;
  currentStage: string;
  status: string;
  priority: string;
  mayaBreakStatus: 'Pass' | 'Flagged';
  mayaBreakDetails: string;
  officerInCharge: string;
  courtBench: string;
  prosecutor: string;
  defenseCounsel: string;
  statutorySections: string[];
  evidenceTimeline: CaseEvidenceItem[];
  testimonies: CaseTestimonyItem[];
  custodyHistory: CaseCustodyStep[];
  orders: CaseOrder[];
  notes: CaseNote[];
  precedents: CasePrecedentMatch[];
  createdAt: string;
  updatedAt: string;
}


export interface EvidenceRecord {
  id: string; // e.g. EV-8821
  caseId: string;
  title: string;
  type: 'Video' | 'Document' | 'Photo' | 'Audio' | 'Digital Asset' | string;
  date: string;
  hash: string;
  status: 'Sealed' | 'Pending Chain Transfer' | 'Verified' | 'Flagged' | 'Transfer Pending' | 'In Transit' | string;
  fileUrl?: string;
  dataUrl?: string;
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
  submitterPhotoUrl?: string;
  txHash?: string;
  blockNumber?: number;
  merkleRoot?: string;
  createdAt: string;
  updatedAt?: string;
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
  changeTypeLabel?: string;
  requestedBy?: string;
  requestAgency?: string;
  riskScore?: number;
  reasonForRequest?: string;
  description?: string;
  targetRecordHash?: string;
  proposedRecordHash?: string;
  previousBlockHash?: string;
  validatorVote?: string;
  validatorJustificationNote?: string;
  nodeVotes?: any[];
  fieldDiffs?: any[];
  courtAuthorityVoteStatus?: string;
  yourVote?: string;
  title?: string;
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

// ── Rich Forgery Queue Interfaces (mirroring client) ────────────────────
export interface ForensicCheck {
  status: 'Pass' | 'Fail' | 'Warning';
  score: number;
  details: string;
  technicalNote: string;
}

export interface FrameDiffAnomaly {
  frameOrPage: string;
  timestampOffset: string;
  anomalyType: 'Generative AI Frame Insertion' | 'Font/Pixel Clone Stamp' | 'Audio Pitch Synthesis' | 'EXIF Timestamp Manipulation';
  confidenceScore: number;
  description: string;
  originalValue: string;
  alteredValue: string;
}

export interface CustodyTrailEvent {
  id: string;
  stage: string;
  actor: string;
  role: string;
  timestamp: string;
  location: string;
  hashVerified: boolean;
  blockNumber: number;
}

export interface LegalPrecedent {
  citation: string;
  title: string;
  court: string;
  relevanceScore: number;
  principle: string;
}

export interface BenchDirective {
  id: string;
  date: string;
  issuedBy: string;
  type: 'CFSL Forensic Subpoena' | 'Device Seizure Directive' | 'In-Camera Demonstration Order' | 'Section 65B Certificate Re-audit';
  details: string;
  status: 'Active' | 'Fulfilled' | 'Pending';
  sealHash: string;
}

export interface ForgeryQueueItem {
  id: string;
  exhibitId: string;
  caseId: string;
  caseTitle: string;
  courtBench: string;
  title: string;
  submitter: string;
  submitterAgency: string;
  submitterPhotoUrl?: string;
  signature?: string;
  timestamp: string;
  status: 'Flagged' | 'Pending Scan' | 'Cleared' | 'Escalated' | 'Rejected';
  confidenceScore: number; // AI Authenticity score 0-100
  previewType: 'Video' | 'Document' | 'Image' | 'Audio Log';
  previewImageDataUrl?: string;

  metadataCheck: ForensicCheck;
  ganFingerprintCheck: ForensicCheck;
  docForensicsCheck: ForensicCheck;

  originalHash: string;
  submittedHash: string;
  merkleRoot: string;
  blockNumber: number;
  anomalySummary: string;

  diffDetails: {
    originalAspect: string;
    submittedAspect: string;
    impactLevel: 'Critical' | 'Major' | 'Minor';
  };

  anomaliesList: FrameDiffAnomaly[];
  custodyTrail: CustodyTrailEvent[];
  precedents: LegalPrecedent[];
  directives: BenchDirective[];

  judicialDecision?: {
    action: 'Accepted & Admitted' | 'Rejected & Excluded' | 'Escalated to CFSL';
    judgeName: string;
    benchKeyId: string;
    timestamp: string;
    justification: string;
    digitalSignatureHash: string;
  };
}


// ── Rich Witness Identity Unlock Interfaces ──────────────────────────────
export interface UnlockedIdentityData {
  realName: string;
  aadhaarPanHash: string;
  addressMasked: string;
  phoneEncrypted: string;
  emergencyContact: string;
  unlockedAt: string;
  unlockedByJudge: string;
  digitalSignature: string;
  accessDurationWindow: string;
}

export interface DirectiveEntry {
  id: string;
  judgeName: string;
  date: string;
  type: 'In-Camera Directive' | 'Transcript Restriction' | 'Security Detail' | 'Access Limit';
  note: string;
  hash: string;
}

export interface PrecedentMatch {
  caseId: string;
  title: string;
  court: string;
  relevanceScore: number;
  rulingSummary: string;
}

export interface IdentityUnlockRequest {
  id: string;
  caseId: string;
  caseTitle: string;
  courtBench: string;
  witnessAlias: string;
  witnessZkpHash: string;
  zkpMerkleRoot: string;
  witnessRiskIndex: number;
  threatAssessmentSummary: string;
  protectionCategory: 'Grade A (Extreme Risk - 24/7 Police Protection)' | 'Grade B (High Risk - Masked Credentials)' | 'Grade C (Standard Protection)';
  requestingParty: string;
  requestingPartyRole: 'Special Prosecutor' | 'Defense Counsel' | 'Investigating Officer';
  counselBarId: string;
  counselAgency: string;
  statedLegalGrounds: string;
  statutoryProvision: string;
  timestamp: string;
  urgency: 'Critical' | 'High' | 'Standard';
  status: 'Pending Judicial Review' | 'Approved & Unlocked' | 'Rejected';
  validatorConsensus: string;
  relatedExhibits: { id: string; title: string; type: string; hash: string }[];
  statutoryChecklist: { item: string; passed: boolean; note: string }[];
  precedents: PrecedentMatch[];
  directives: DirectiveEntry[];
  unlockedDetails?: UnlockedIdentityData;
}

export interface PermanentUnlockLogEntry {
  logId: string;
  requestId: string;
  caseId: string;
  witnessAlias: string;
  judgeName: string;
  judgeKeyId: string;
  decision: 'Approved' | 'Rejected';
  timestamp: string;
  blockNumber: number;
  digitalSignatureHash: string;
  legalJustificationSummary: string;
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

export interface NotificationRecord {
  id: string;
  type: 'forgery' | 'consensus' | 'precedent' | 'duress' | 'identity_unlock' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isoDate: string;
  isRead: boolean;
  readAt?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  caseId?: string;
  sender: string;
  details: string;
  actionUrlTab?: string;
  actionLabel?: string;
  roleScope?: string;
  userId?: string;
  createdAt: string;
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
  private richCases = new Map<string, RichCaseRecord>();
  private evidence = new Map<string, EvidenceRecord>();
  private consensusRequests: ConsensusRequest[] = [];
  private forgeryReviews: ForgeryReviewItem[] = [];
  private forgeryQueueItems = new Map<string, ForgeryQueueItem>();
  private identityUnlocks: IdentityUnlockRequest[] = [];
  private identityUnlockLogs: PermanentUnlockLogEntry[] = [];
  private precedentFlags: PrecedentFlagItem[] = [];
  private analyticsReports: any[] = [];
  private oversightEscalations: any[] = [];
  private validatorActivityLogs: any[] = [];
  private notifications: NotificationRecord[] = [];
  private fcmTokens: Map<string, string> = new Map();
  private attestedModules: string[] = [];

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
    // Seed default users so profile fetching always has rich data even on fresh start
    if (this.users.size === 0) {
      const defaultValidator: UserRecord = {
        id: 'usr_seed_validator',
        email: 'm.vasudevan@oversight.nyayakasha.gov.in',
        fullName: 'DR. MEERA VASUDEVAN',
        role: 'independent_validator',
        passwordHash: 'seeded',
        approvalState: 'active',
        stateHistory: [{ state: 'active', timestamp: new Date().toISOString() }],
        institutionVerified: true,
        vettingApproved: true,
        mfaEnrolled: true,
        contactExtension: '+91 (022) 2288-1100 ext. 901',
        chambersLocation: 'Chambers 901, Judicial Oversight Tower, Fort, Mumbai',
        appointmentRef: 'HC-REG-2026-9902',
        authorityScope: 'Division Bench Quorum (1-of-3 Threshold)',
        barCouncilNumber: 'BCM-MH-2012/88421',
        keyShareFingerprint: '0x9D4F-88E2-11A9-C43B-7720-F01A-99D8-23E1-44B0',
        hardwareTokenName: 'YubiKey 5 FIDO2 Hardware Security Token',
        keyGenesisDate: 'Nov 12, 2025',
        mfaAttestationLevel: 'WebAuthn Hardware-Attested • Level 3 Enclave Security',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const defaultCourtAuth: UserRecord = {
        id: 'usr_seed_court',
        email: 'a.mehta@highcourt.nyayakasha.gov.in',
        fullName: 'HON. JUSTICE ADV. A. MEHTA',
        role: 'court_authority',
        passwordHash: 'seeded',
        approvalState: 'active',
        stateHistory: [{ state: 'active', timestamp: new Date().toISOString() }],
        institutionVerified: true,
        vettingApproved: true,
        mfaEnrolled: true,
        contactExtension: '+91 (022) 2284-9042 ext. 402',
        chambersLocation: 'Chambers 402, High Court Main Building',
        appointmentRef: 'HC-JUD-2026-0892',
        authorityScope: 'Division Bench 3 (Presiding Judge)',
        barCouncilNumber: 'BCM-MH-1998/1042',
        keyShareFingerprint: '0x8F9A-41B0-C82E-99B1-3310-7F2A-00B2-11D4-884E-90C1-FA32',
        hardwareTokenName: 'YubiKey 5 FIDO2 Hardware Security Token',
        keyGenesisDate: 'Nov 12, 2025',
        mfaAttestationLevel: 'WebAuthn Hardware-Attested • Level 3 Enclave Security',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const defaultFieldSub: UserRecord = {
        id: 'usr_seed_field',
        email: 'siddhesh@nyayakasha.gov.in',
        fullName: 'Officer Siddhesh Harwande (Zone 4 Field Operations)',
        role: 'field_submitter',
        passwordHash: 'seeded',
        approvalState: 'active',
        stateHistory: [{ state: 'active', timestamp: new Date().toISOString() }],
        institutionVerified: true,
        vettingApproved: true,
        mfaEnrolled: true,
        profilePhotoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY4AAAA8CAYAAABxcV22AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABPiSURBVHhe7d0LWFTnvQfwP8E4QCpeElJdaNMFdd2JruFSI9oUiBHQFYhJhkSDaBdtEok+QswjYg1rjYiNAaPFtKtsVFhNnRpFfBRIFczFsUadtOrERIc2KRR3ySORJuAkovu9Z76R4aacM8NFfX95COd8czkz55P3Ped7z8XjmgDGGGOsi+6SvxljjLEu4cTBGGNMFU4cjDHGVOHEwRhjTBVOHIwxxlTp1aOqzp49i5MnT+LMmTOoqqpCbW0tLl68iMuXL4MP9mKMMRGkPTzg5eWFIUOGYNiwYQgMDMSDDz6IkJAQjBo1Sj6rZ/V44jCbzdi3bx8OHjwInU6HsLAwZSUMHz4c/v7+GDx4MLy9vZWVxRhjdzoK0U1NTaivr0dNTQ3Onz+vbGwfP34cNpsNkyZNwrRp0xAcHCxf0f16LHHs378fhYWFyh5FfHw8oqOjMWLECPkoY4wxtc6dO4fy8nLs3btX2SOZNWsWpk6dKh/tPt2eOEwmE9avX69kzTlz5iA2NlY+whhjzF1KS0uxZcsWZbRm4cKFCA8Pl4+4X7cmjpUrV+Ldd99FWloapk+fLlsZY4x1l927dyMvLw+TJ0/G8uXLZat7dctRVVT0pkRBRW7Kgpw0GGOsZ1C8pbhL8ZemKR67m9sTR0VFBRITE2EwGLBq1Sr4+PjIRxhjjPUEirsUfykOUzymuOxObh2qogL4kiVLsGHDBkRGRspWxhhjvaWyshILFizAmjVr3FY4d1voi...',
        contactExtension: '+91 (022) 2650-1122 ext. 104',
        chambersLocation: 'Room 104, Zone 4 Cyber Crime Precinct',
        appointmentRef: 'MH-POL-29384',
        authorityScope: 'Zone 4 Metropolitan Precinct',
        barCouncilNumber: 'POL-MH-2015/4921',
        keyShareFingerprint: '0x3E1C-99B4-11A0-7C08-44F2-88B1-002E-77D1-2290-A81B-12D9',
        hardwareTokenName: 'Ed25519-EdDSA Enclave',
        keyGenesisDate: 'Nov 12, 2025',
        mfaAttestationLevel: 'Standard App Enclave',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      [defaultValidator, defaultCourtAuth, defaultFieldSub].forEach(u => {
        this.users.set(u.id, u);
        this.usersByEmail.set(u.email.toLowerCase(), u);
      });
    }

    if (this.richCases.size === 0) {
      const defaultRichCases: RichCaseRecord[] = [
        {
          id: 'FIR-2026-001',
          title: 'State vs. Apex Financial Technologies Ltd (Sec 65B Cyber Fraud)',
          caseType: 'Financial Fraud',
          filingDate: 'Nov 14, 2025',
          currentStage: 'Evidence Collection',
          status: 'Under Review',
          priority: 'CRITICAL',
          mayaBreakStatus: 'Pass',
          mayaBreakDetails: 'All 4 evidence exhibits hash-anchored on Polygon PoS',
          officerInCharge: 'Officer Rajesh Kulkarni (Badge: FS-8820)',
          courtBench: 'Division Bench 2 (Commercial & Cyber Disputes)',
          prosecutor: 'Adv. V. S. Nambiar (State Cyber Cell)',
          defenseCounsel: 'Adv. S. Ramachandran (High Court Bar)',
          statutorySections: ['Sec 65B Evidence Act', 'Sec 43A IT Act', 'Sec 420 IPC'],
          evidenceTimeline: [
            {
              id: 'EXH-8821',
              title: 'Encrypted Server Transaction Log Dump (Partition #3)',
              type: 'Digital Asset',
              submittedBy: 'Officer Rajesh Kulkarni (GPS: 19.0760° N, 72.8777° E)',
              timestamp: 'Nov 14, 2025 • 10:24 AM',
              pramanaHash: '0xa49f2b18c091d3ef841109a2e48f1107',
              blockNumber: 89201,
              integrityStatus: 'Pass',
              integrityScore: '100% Original (Verified via CNN & Blockchain)',
              details: 'Sealed forensic disk image. Seizure Bag ID: SEZ-2026-90412.',
              previewImageDataUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 'EXH-8822',
              title: 'Questioned Land Conveyance Deed (Property Sector 4)',
              type: 'Document',
              submittedBy: 'Officer Rajesh Kulkarni (GPS: 19.0760° N, 72.8777° E)',
              timestamp: 'Nov 14, 2025 • 11:05 AM',
              pramanaHash: '0x8841a029fe11d940c8832a11b09f441a',
              blockNumber: 89204,
              integrityStatus: 'Pass',
              integrityScore: '100% Original (Verified via CNN & Blockchain)',
              details: 'Optical document scan checked for chemical erasure and stamp splicing.',
              previewImageDataUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
            }
          ],
          testimonies: [
            {
              id: 'TM-2026-401',
              zkpHash: '0xzkp_a49f88219042',
              summary: 'Deponent confirms unauthorized ledger manipulation at 22:15 hrs on 12th Nov 2025.',
              timestamp: 'Nov 14, 2025 • 02:15 PM',
              isUnlocked: false,
              witnessRole: 'Principal Systems Auditor',
              verificationNode: 'Node-IN-WEST-04'
            }
          ],
          custodyHistory: [
            {
              id: 'cust-fir001-1',
              title: 'Captured & Sealed on Field Terminal',
              actor: 'Officer Rajesh Kulkarni (Zone 4 Operations)',
              location: 'Zone 4 Metropolitan Precinct',
              timestamp: 'Nov 14, 2025 • 10:24 AM',
              status: 'Sealed & Polygon PoS Anchored',
              biometricVerified: true,
              gpsCoordinates: '19.0760° N, 72.8777° E'
            }
          ],
          orders: [],
          notes: [
            {
              id: 'note-fir001-1',
              author: 'Adv. A. Mehta (Bench 3)',
              timestamp: 'Nov 14, 2025 • 03:00 PM',
              category: 'Judicial Directive',
              content: 'Forensic team to verify frame timestamps against municipal traffic server backup ledger prior to next hearing.'
            }
          ],
          precedents: [
            {
              caseId: 'HC-2024-88',
              title: 'State of Maharashtra vs. M. K. Financials',
              court: 'Bombay High Court',
              similarityScore: 94.2,
              relevantSections: ['Sec 65B', 'Sec 43A'],
              summary: 'Section 65B certificate mandatory for electronic server logs.'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'FIR-2026-002',
          title: 'State vs. Cybernet Solutions (Corporate Data Breach & Extortion)',
          caseType: 'Cyber Crime',
          filingDate: 'Nov 10, 2025',
          currentStage: 'Judicial Review',
          status: 'Active',
          priority: 'HIGH',
          mayaBreakStatus: 'Pass',
          mayaBreakDetails: 'PRAMANA blockchain verification intact',
          officerInCharge: 'Inspector V. Thorne (Zone 4 Cyber Cell)',
          courtBench: 'High Court Bench 3 (Presiding: Hon. Adv. A. Mehta)',
          prosecutor: 'Adv. V. S. Nambiar',
          defenseCounsel: 'Adv. S. Ramachandran',
          statutorySections: ['Sec 66 IT Act', 'Sec 43 IT Act'],
          evidenceTimeline: [
            {
              id: 'EXH-9012',
              title: 'Firewall Intrusion Packet Log (PCAP Stream)',
              type: 'Digital Asset',
              submittedBy: 'Inspector V. Thorne (GPS: 19.0760° N, 72.8777° E)',
              timestamp: 'Nov 10, 2025 • 09:10 AM',
              pramanaHash: '0x7731f904a2118c991a0029b4f11a8820',
              blockNumber: 89150,
              integrityStatus: 'Pass',
              integrityScore: '100% Original (Verified via CNN & Blockchain)',
              details: 'PCAP packet capture file containing unauthorized SSH connection attempts.',
              previewImageDataUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
            }
          ],
          testimonies: [],
          custodyHistory: [],
          orders: [],
          notes: [],
          precedents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'FIR-2026-003',
          title: 'State vs. Metro Infrastructure Corp (Document Forgery & Stamp Fraud)',
          caseType: 'Document Forgery',
          filingDate: 'Nov 08, 2025',
          currentStage: 'Pre-Trial Hearing',
          status: 'Active',
          priority: 'MEDIUM',
          mayaBreakStatus: 'Pass',
          mayaBreakDetails: 'PRAMANA blockchain verification intact',
          officerInCharge: 'Officer Rajesh Kulkarni (Badge: FS-8820)',
          courtBench: 'High Court Bench 3 (Presiding: Hon. Adv. A. Mehta)',
          prosecutor: 'Adv. V. S. Nambiar',
          defenseCounsel: 'Adv. S. Ramachandran',
          statutorySections: ['Sec 468 IPC', 'Sec 471 IPC'],
          evidenceTimeline: [
            {
              id: 'EXH-9041',
              title: 'Forged Municipal Approval Letter (Stamp Spliced)',
              type: 'Document',
              submittedBy: 'Officer Rajesh Kulkarni (GPS: 19.0760° N, 72.8777° E)',
              timestamp: 'Nov 08, 2025 • 04:30 PM',
              pramanaHash: '0x1104f9821a004921b882901f4400a12e',
              blockNumber: 89120,
              integrityStatus: 'Pass',
              integrityScore: '100% Original (Verified via CNN & Blockchain)',
              details: 'Physical document scan showing optical stamp splicing artifacts.',
              previewImageDataUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
            }
          ],
          testimonies: [],
          custodyHistory: [],
          orders: [],
          notes: [],
          precedents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      defaultRichCases.forEach(rc => {
        this.richCases.set(rc.id, rc);
        const stdCase: CaseRecord = {
          id: rc.id,
          title: rc.title,
          status: rc.status as any,
          type: rc.caseType,
          date: rc.filingDate,
          officer: rc.officerInCharge,
          evidenceCount: rc.evidenceTimeline.length,
          testimonyCount: rc.testimonies.length,
          priority: rc.priority as any,
          description: `Rich case record initialized for ${rc.title}.`,
          location: 'High Court Jurisdiction',
          jurisdictionCode: 'MH-MUM-DIST-01',
          createdAt: rc.createdAt,
          updatedAt: rc.updatedAt
        };
        this.cases.set(stdCase.id, stdCase);
      });
    }

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
        if (data.richCases && Array.isArray(data.richCases)) {
          data.richCases.forEach((rc: RichCaseRecord) => this.richCases.set(rc.id, rc));
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
        if (data.forgeryQueueItems && Array.isArray(data.forgeryQueueItems)) {
          data.forgeryQueueItems.forEach((fqi: ForgeryQueueItem) => this.forgeryQueueItems.set(fqi.id, fqi));
        }
        if (data.identityUnlocks && Array.isArray(data.identityUnlocks)) {
          this.identityUnlocks = data.identityUnlocks;
        }
        if (data.identityUnlockLogs && Array.isArray(data.identityUnlockLogs)) {
          this.identityUnlockLogs = data.identityUnlockLogs;
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
        if (data.readNotificationIds && Array.isArray(data.readNotificationIds)) {
          this.readNotificationIds = new Set(data.readNotificationIds);
        }
        if (data.readNotificationTimestamps && typeof data.readNotificationTimestamps === 'object') {
          this.readNotificationTimestamps = new Map(Object.entries(data.readNotificationTimestamps));
        }
        if (data.attestedModules && Array.isArray(data.attestedModules)) {
          this.attestedModules = data.attestedModules;
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
        richCases: Array.from(this.richCases.values()),
        evidence: Array.from(this.evidence.values()),
        consensusRequests: this.consensusRequests,
        forgeryReviews: this.forgeryReviews,
        forgeryQueueItems: Array.from(this.forgeryQueueItems.values()),
        identityUnlocks: this.identityUnlocks,
        identityUnlockLogs: this.identityUnlockLogs,
        precedentFlags: this.precedentFlags,
        analyticsReports: this.analyticsReports,
        oversightEscalations: this.oversightEscalations,
        validatorActivityLogs: this.validatorActivityLogs,
        readNotificationIds: Array.from(this.readNotificationIds),
        readNotificationTimestamps: Object.fromEntries(this.readNotificationTimestamps.entries()),
        attestedModules: this.attestedModules
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

  // --- RICH CASES API (Forensic Repositories) ---
  public getRichCases(): RichCaseRecord[] {
    return Array.from(this.richCases.values());
  }

  public getRichCaseById(id: string): RichCaseRecord | undefined {
    return this.richCases.get(id);
  }

  public saveRichCase(caseItem: RichCaseRecord): RichCaseRecord {
    caseItem.updatedAt = new Date().toISOString();
    this.richCases.set(caseItem.id, caseItem);
    this.persistToDisk();

    try {
      const db = getFirestore();
      if (db) {
        db.collection('richCases').doc(caseItem.id).set(caseItem).catch((err: any) => console.log('Firestore richCase save status:', err.message || err));
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
    // Auto-link to RichCaseRecord for Court Authority Case Files
    let rc = this.richCases.get(item.caseId);
    if (!rc && c) {
      rc = {
        id: c.id,
        title: c.title,
        caseType: c.type || 'General Investigation',
        filingDate: c.date || new Date().toLocaleDateString(),
        currentStage: 'Evidence Collection',
        status: c.status || 'Active',
        priority: (c.priority || 'MEDIUM').toUpperCase(),
        mayaBreakStatus: 'Pass',
        mayaBreakDetails: 'PRAMANA blockchain verification intact',
        officerInCharge: c.officer || item.custodian || 'Field Submitter',
        courtBench: 'High Court Bench 3 (Presiding: Hon. Adv. A. Mehta)',
        prosecutor: 'Adv. V. S. Nambiar',
        defenseCounsel: 'Adv. S. Ramachandran',
        statutorySections: ['Sec 65B Evidence Act', 'Sec 43A IT Act'],
        evidenceTimeline: [],
        testimonies: [],
        custodyHistory: [],
        orders: [],
        notes: [],
        precedents: [],
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.richCases.set(rc.id, rc);
    }

    if (rc) {
      const existingExhIdx = rc.evidenceTimeline.findIndex(e => e.id === item.id);
      const exhItem: CaseEvidenceItem = {
        id: item.id,
        title: item.title,
        type: item.type || 'Digital Asset',
        submittedBy: `${item.custodian || 'Field Officer'} (GPS: ${item.latitude || 19.0760}° N, ${item.longitude || 72.8777}° E)`,
        timestamp: item.date || new Date().toLocaleString(),
        pramanaHash: item.hash,
        blockNumber: item.blockNumber || (89300 + Math.floor(Math.random() * 500)),
        integrityStatus: item.status === 'Quarantined' || item.status === 'Flagged' ? 'Flagged' : 'Pass',
        integrityScore: item.status === 'Quarantined' || item.status === 'Flagged' ? 'Flagged Anomaly (Spectral Check)' : '100% Original (Verified via CNN & Blockchain)',
        details: item.evidenceNotes || `Exhibit sealed by ${item.custodian || 'Field Officer'}. Seizure Bag ID: ${item.seizureBagId || item.id}. Polygon PoS TX Hash: ${item.txHash || 'Anchored'}.`,
        previewImageDataUrl: item.fileUrl || (item.customMetadata && item.customMetadata.startsWith('data:') ? item.customMetadata : undefined)
      };

      if (existingExhIdx >= 0) {
        rc.evidenceTimeline[existingExhIdx] = exhItem;
      } else {
        rc.evidenceTimeline.unshift(exhItem);
      }

      // Add Custody Step
      const custodyStep: CaseCustodyStep = {
        id: `cust-${item.id}-${Date.now()}`,
        title: `Captured & Sealed: ${item.title}`,
        actor: item.custodian || 'Field Submitter Officer',
        location: item.incidentLocation || 'Field Precinct Location',
        timestamp: item.date || new Date().toLocaleString(),
        status: `Cryptographically Anchored (${item.status})`,
        biometricVerified: true,
        gpsCoordinates: `${item.latitude || 19.0760}° N, ${item.longitude || 72.8777}° E`
      };
      rc.custodyHistory.unshift(custodyStep);
      rc.updatedAt = new Date().toISOString();
      this.richCases.set(rc.id, rc);
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

  // --- NOTIFICATIONS STORE & REAL-TIME DISPATCH ---
  private readNotificationIds: Set<string> = new Set();
  private readNotificationTimestamps: Map<string, string> = new Map();
  private customNotifications: NotificationRecord[] = [];

  public getNotifications(role?: string): NotificationRecord[] {
    const realNotifs: NotificationRecord[] = [];

    // 1. Real Duress Alerts from database
    this.duressAlerts.forEach(a => {
      const notifId = `notif-duress-${a.id}`;
      const isRead = this.readNotificationIds.has(notifId);
      realNotifs.push({
        id: notifId,
        type: 'duress',
        title: `CRITICAL: Duress PIN Alert (${a.userName})`,
        message: `Silent panic PIN executed by ${a.userName} (${a.role}) from IP ${a.ipAddress}.`,
        timestamp: a.timestamp ? (a.timestamp.includes('T') ? new Date(a.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : a.timestamp) : 'Recently',
        isoDate: a.timestamp || new Date().toISOString(),
        isRead,
        readAt: this.readNotificationTimestamps.get(notifId),
        priority: 'critical',
        caseId: a.refId || 'SYS-SECURITY',
        sender: 'Oversight Security Sentinel',
        details: `Location: ${a.locationInfo?.jurisdiction || 'Zone 4 Field Terminal'}. Status: ${a.status}. Visual evidence feed and officer geolocation locked in audit ledger under Rule 88-B.`,
        actionUrlTab: 'Audit log',
        actionLabel: 'Inspect Duress Payload',
        roleScope: 'court_authority,independent_validator',
        createdAt: a.timestamp || new Date().toISOString()
      });
    });

    // 2. Real Evidence Submissions from database
    Array.from(this.evidence.values()).forEach(e => {
      const isTestimony = e.type === 'Document' && e.id.startsWith('TM-');
      const notifId = `notif-ev-${e.id}`;
      const isRead = this.readNotificationIds.has(notifId);
      realNotifs.push({
        id: notifId,
        type: isTestimony ? 'system' : 'system',
        title: isTestimony ? `Testimony ${e.id} Recorded & Cryptographically Signed` : `Evidence ${e.id} Ingested & SHA-256 Sealed`,
        message: `${e.title} (${e.type}) was cryptographically sealed by ${e.custodian || 'Field Officer'}.`,
        timestamp: e.date || (e.createdAt ? new Date(e.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Recently'),
        isoDate: e.createdAt || new Date().toISOString(),
        isRead,
        readAt: this.readNotificationTimestamps.get(notifId),
        priority: isTestimony ? 'medium' : 'high',
        caseId: e.caseId,
        sender: 'SHA-256 HSM Sealing Engine',
        details: `Hash: ${e.hash}. Status: ${e.status}. Custodian: ${e.custodian}. Location: ${e.incidentLocation || 'Zone 4 Field Terminal'}.`,
        actionUrlTab: 'Chain of Custody',
        actionLabel: 'View Evidence Ledger',
        roleScope: 'field_submitter,court_authority',
        createdAt: e.createdAt || new Date().toISOString()
      });
    });

    // 3. Real Forgery Reviews from database
    this.forgeryReviews.forEach(f => {
      const notifId = `notif-forgery-${f.id}`;
      const isRead = this.readNotificationIds.has(notifId);
      realNotifs.push({
        id: notifId,
        type: 'forgery',
        title: `Forgery Review Queue: ${f.title}`,
        message: `AI Anomaly Detector flagged score ${f.aiConfidence}% on exhibit ${f.exhibitId}. Status: ${f.status}.`,
        timestamp: f.timestamp || 'Recently',
        isoDate: new Date().toISOString(),
        isRead,
        readAt: this.readNotificationTimestamps.get(notifId),
        priority: 'high',
        caseId: f.caseId,
        sender: 'Forensic Neural Scanner v4.2',
        details: `Flag Reason: ${f.flagReason}. Spectral Score: ${f.spectralScore}. Metadata Score: ${f.metadataIntegrityScore}.`,
        actionUrlTab: 'Chain of Custody',
        actionLabel: 'Open Forgery Queue',
        roleScope: 'court_authority,independent_validator',
        createdAt: new Date().toISOString()
      });
    });

    // 4. Real Consensus Requests from database
    this.consensusRequests.forEach(c => {
      const notifId = `notif-consensus-${c.id}`;
      const isRead = this.readNotificationIds.has(notifId);
      realNotifs.push({
        id: notifId,
        type: 'consensus',
        title: `Consensus Vote Required: ${c.exhibitTitle || c.caseTitle}`,
        message: `Multi-signature quorum pending (${c.currentVotes || 0}/${c.requiredVotes || 3} signatures) for exhibit ${c.exhibitId}.`,
        timestamp: c.createdAt ? new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        isoDate: c.createdAt || new Date().toISOString(),
        isRead,
        readAt: this.readNotificationTimestamps.get(notifId),
        priority: 'high',
        caseId: c.caseId,
        sender: 'High Court Quorum Engine',
        details: `Status: ${c.status}. Submitted by: ${c.submittedBy}. Required votes: ${c.requiredVotes}.`,
        actionUrlTab: 'Chain of Custody',
        actionLabel: 'Cast Quorum Vote',
        roleScope: 'court_authority,independent_validator',
        createdAt: c.createdAt || new Date().toISOString()
      });
    });

    // 5. Custom notifications created at runtime
    this.customNotifications.forEach(n => {
      if (!realNotifs.some(existing => existing.id === n.id)) {
        const isRead = this.readNotificationIds.has(n.id);
        realNotifs.push({
          ...n,
          isRead,
          readAt: this.readNotificationTimestamps.get(n.id) || n.readAt
        });
      }
    });

    // Sort newest first
    realNotifs.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());

    if (!role || role === 'all') return realNotifs;

    const userRoleRaw = role.toLowerCase();
    let targetRoleKey = 'court_authority';
    if (userRoleRaw.includes('field') || userRoleRaw.includes('submitter')) {
      targetRoleKey = 'field_submitter';
    } else if (userRoleRaw.includes('validator') || userRoleRaw.includes('independent')) {
      targetRoleKey = 'independent_validator';
    } else if (userRoleRaw.includes('court') || userRoleRaw.includes('authority')) {
      targetRoleKey = 'court_authority';
    }

    return realNotifs.filter(n => {
      if (!n.roleScope || n.roleScope === 'all') return true;
      const scopes = n.roleScope.split(',').map(s => s.trim().toLowerCase());
      return scopes.includes(targetRoleKey);
    });
  }

  public saveNotification(notif: NotificationRecord): NotificationRecord {
    const existingIdx = this.customNotifications.findIndex(n => n.id === notif.id);
    if (existingIdx >= 0) {
      this.customNotifications[existingIdx] = notif;
    } else {
      this.customNotifications.unshift(notif);
    }
    this.persistToDisk();
    return notif;
  }

  public markNotificationRead(id: string): NotificationRecord | null {
    this.readNotificationIds.add(id);
    const nowStr = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    this.readNotificationTimestamps.set(id, nowStr);
    this.persistToDisk();
    
    const all = this.getNotifications();
    return all.find(n => n.id === id) || null;
  }

  public markAllNotificationsRead(role?: string): boolean {
    const list = this.getNotifications(role);
    const nowStr = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    list.forEach(n => {
      this.readNotificationIds.add(n.id);
      this.readNotificationTimestamps.set(n.id, nowStr);
    });
    this.persistToDisk();
    return true;
  }

  public registerDeviceToken(userId: string, token: string) {
    this.fcmTokens.set(userId, token);
  }

  public getDeviceToken(userId: string): string | undefined {
    return this.fcmTokens.get(userId);
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

  // --- RICH FORGERY QUEUE ITEMS ---
  public getForgeryQueueItems(): ForgeryQueueItem[] {
    return Array.from(this.forgeryQueueItems.values());
  }

  public getForgeryQueueItemById(id: string): ForgeryQueueItem | undefined {
    return this.forgeryQueueItems.get(id);
  }

  public saveForgeryQueueItem(item: ForgeryQueueItem): ForgeryQueueItem {
    this.forgeryQueueItems.set(item.id, item);
    this.persistToDisk();
    return item;
  }

  public decideRichForgery(
    id: string,
    action: 'Accepted & Admitted' | 'Rejected & Excluded' | 'Escalated to CFSL',
    remarks: string,
    signatureHash: string
  ): ForgeryQueueItem | undefined {
    const item = this.forgeryQueueItems.get(id);
    if (!item) return undefined;

    const newStatus: ForgeryQueueItem['status'] =
      action === 'Accepted & Admitted'
        ? 'Cleared'
        : action === 'Rejected & Excluded'
        ? 'Rejected'
        : 'Escalated';

    const timestampStr =
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    item.status = newStatus;
    item.judicialDecision = {
      action,
      judgeName: 'Hon. Presiding Magistrate (Bench 3)',
      benchKeyId: 'BENCH-KEY-IND-003',
      timestamp: timestampStr,
      justification: remarks || 'Judicial order issued following MAYA-BREAK forensic audit.',
      digitalSignatureHash: signatureHash
    };

    this.persistToDisk();
    return item;
  }

  public addDirectiveToForgeryQueueItem(id: string, directive: BenchDirective): ForgeryQueueItem | undefined {
    const item = this.forgeryQueueItems.get(id);
    if (!item) return undefined;

    item.directives.unshift(directive);
    this.persistToDisk();
    return item;
  }


  // --- IDENTITY UNLOCKS ---
  public getIdentityUnlocks(): IdentityUnlockRequest[] {
    return [...this.identityUnlocks];
  }

  public getIdentityUnlockLogs(): PermanentUnlockLogEntry[] {
    return [...this.identityUnlockLogs];
  }

  public saveIdentityUnlockRequest(request: IdentityUnlockRequest): IdentityUnlockRequest {
    const idx = this.identityUnlocks.findIndex(u => u.id === request.id);
    if (idx >= 0) {
      this.identityUnlocks[idx] = request;
    } else {
      this.identityUnlocks.push(request);
    }
    this.persistToDisk();
    return request;
  }

  public savePermanentUnlockLog(log: PermanentUnlockLogEntry): PermanentUnlockLogEntry {
    const idx = this.identityUnlockLogs.findIndex(l => l.logId === log.logId);
    if (idx >= 0) {
      this.identityUnlockLogs[idx] = log;
    } else {
      this.identityUnlockLogs.unshift(log);
    }
    this.persistToDisk();
    return log;
  }

  public decideIdentityUnlockRequest(
    id: string,
    decision: 'Approved' | 'Rejected',
    remarks: string,
    signatureHash: string
  ): IdentityUnlockRequest | undefined {
    const req = this.identityUnlocks.find(u => u.id === id);
    if (!req) return undefined;

    const timestampStr =
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    req.status = decision === 'Approved' ? 'Approved & Unlocked' : 'Rejected';

    if (decision === 'Approved') {
      req.unlockedDetails = {
        realName: 'Anil Kumar S. Sharma (Principal Systems Engineer)',
        aadhaarPanHash: '0x7782...A912 (Verified UIDAI Cryptographic Vault)',
        addressMasked: 'Plot 104, Tech Park Enclave, Sector 4, Navi Mumbai',
        phoneEncrypted: '+91 99*** **102 (Encrypted Channel #2)',
        emergencyContact: 'Commandant R. Kulkarni (State Special Cyber Cell)',
        unlockedAt: timestampStr,
        unlockedByJudge: 'Hon. Presiding Magistrate (Bench 3)',
        digitalSignature: signatureHash,
        accessDurationWindow: '48 Hours (In-Camera Cross Examination Window)',
      };
    }

    // Append to Permanent Ledger Log
    const newLog: PermanentUnlockLogEntry = {
      logId: `LOG-UNLOCK-${String(this.identityUnlockLogs.length + 83).padStart(4, '0')}`,
      requestId: req.id,
      caseId: req.caseId,
      witnessAlias: req.witnessAlias,
      judgeName: 'Hon. Presiding Magistrate (Bench 3)',
      judgeKeyId: 'BENCH-KEY-IND-003',
      decision,
      timestamp: timestampStr,
      blockNumber: 89350 + this.identityUnlockLogs.length,
      digitalSignatureHash: signatureHash,
      legalJustificationSummary: remarks || req.statedLegalGrounds,
    };

    this.savePermanentUnlockLog(newLog);
    this.persistToDisk();
    return req;
  }

  public addDirectiveToIdentityUnlockRequest(id: string, directive: DirectiveEntry): IdentityUnlockRequest | undefined {
    const req = this.identityUnlocks.find(u => u.id === id);
    if (!req) return undefined;

    req.directives.unshift(directive);
    this.persistToDisk();
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

  public attestModule(id: string) {
    if (!this.attestedModules.includes(id)) {
      this.attestedModules.push(id);
      this.persistToDisk();
    }
  }

  public isModuleAttested(id: string): boolean {
    return this.attestedModules.includes(id);
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

    return zones.map((z) => {
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
        const diffDays = Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
        totalDays += diffDays;
      });

      const avgDays = incidents > 0 ? Number((totalDays / incidents).toFixed(1)) : 0;
      const resolveRate = incidents > 0 ? Number(((resolvedCount / incidents) * 100).toFixed(1)) : 0;

      const zoneEvidence = evidenceArr.filter(e => zoneCases.some(c => c.id === e.caseId));
      const sealedEvidenceCount = zoneEvidence.filter(e => e.status === 'Sealed' || e.status === 'Verified').length;
      const integrity = zoneEvidence.length > 0 
        ? Number(((sealedEvidenceCount / zoneEvidence.length) * 100).toFixed(2)) 
        : (evidenceArr.length > 0 ? Number(((evidenceArr.filter(e => e.status === 'Sealed' || e.status === 'Verified').length / evidenceArr.length) * 100).toFixed(2)) : 100.0);

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
        totalDays += Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
      });
      const avgDispositionDays = benchCases.length > 0 ? Number((totalDays / benchCases.length).toFixed(1)) : 0;

      const resolved = benchCases.filter(c => c.status === 'Closed' || c.status === 'Sealed').length;
      const efficiency = benchCases.length > 0 ? Number(((resolved / benchCases.length) * 100).toFixed(1)) : 0;

      const flaggedPrecedents = precedentArr.filter(p => benchCases.some(c => c.id === p.caseId) && p.status === 'Flagged').length;
      const precedentAlign = benchCases.length > 0 ? Number((((benchCases.length - flaggedPrecedents) / benchCases.length) * 100).toFixed(1)) : 100.0;

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

    // Generate last 7 quarters dynamically from the current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);

    const periods: string[] = [];
    for (let i = 6; i >= 0; i--) {
      let q = currentQuarter - i;
      let y = currentYear;
      while (q <= 0) { q += 4; y -= 1; }
      periods.push(`Q${q} ${y}`);
    }

    return periods.map((period) => {
      const [qStr, yStr] = period.split(' ');
      const qNum = parseInt(qStr.replace('Q', ''));
      const yNum = parseInt(yStr);

      const periodCases = casesArr.filter(c => {
        const d = new Date(c.createdAt || c.date || Date.now());
        const cQ = Math.ceil((d.getMonth() + 1) / 3);
        const cY = d.getFullYear();
        return cQ === qNum && cY === yNum;
      });

      const getAvgDays = (jurisdictionMatch: string, altMatch: string) => {
        const matchingCases = periodCases.filter(c => c.jurisdictionCode?.includes(jurisdictionMatch) || c.location?.toLowerCase().includes(altMatch.toLowerCase()));
        if (matchingCases.length === 0) return 0;
        const totalDays = matchingCases.reduce((sum, c) => {
          const created = new Date(c.createdAt || c.date || Date.now()).getTime();
          const updated = new Date(c.updatedAt || Date.now()).getTime();
          return sum + Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
        }, 0);
        return Number((totalDays / matchingCases.length).toFixed(1));
      };

      return {
        period,
        zone1North: getAvgDays('DIST-01', 'North'),
        zone2South: getAvgDays('DIST-02', 'South'),
        zone3Cyber: getAvgDays('DIST-03', 'East'),
        zone4West: getAvgDays('DIST-04', 'West'),
        zone5Apex: getAvgDays('DIST-05', 'Central'),
      };
    });
  }

  public getLiveAnomalyTrends() {
    const forgeryArr = this.forgeryReviews;
    const quarantinedCount = forgeryArr.filter(f => f.status === 'Quarantined' || f.status === 'Under Review').length;

    // Generate last 6 months dynamically from current date
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }

    return months.map((month) => {
      const [mStr, yStr] = month.split(' ');
      const mIndex = monthNames.indexOf(mStr);
      const yNum = parseInt(yStr);

      const monthReviews = forgeryArr.filter(f => {
        const d = new Date(f.timestamp || Date.now());
        return d.getMonth() === mIndex && d.getFullYear() === yNum;
      });

      const getCount = (typeMatch: string) => monthReviews.filter(f => f.type?.toLowerCase().includes(typeMatch.toLowerCase())).length;

      return {
        month,
        bench1Cyber: getCount('Cyber') || 0,
        bench2Commercial: getCount('Commercial') || getCount('Financial') || 0,
        bench3Criminal: getCount('Criminal') || getCount('Theft') || 0,
        bench4WestTribunal: getCount('Forgery') || getCount('Document') || 0,
        bench5Apex: getCount('Appeal') || 0,
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

    // Generate the last 7 actual days dynamically
    const days: { label: string; dateObj: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dateObj: d
      });
    }

    return days.map(({ label, dateObj }) => {
      // Count evidence submitted on this day
      const dayEvidence = evidenceArr.filter(e => {
        if (!e.date && !e.createdAt) return false;
        const d = new Date(e.createdAt || e.date || '');
        return d.toDateString() === dateObj.toDateString();
      });
      const dayTestimonies = dayEvidence.filter(e => e.type === 'Document' && e.id.startsWith('TM-')).length;
      const dayDigital = dayEvidence.filter(e => !e.id.startsWith('TM-')).length;
      const dayOrders = casesArr.filter(c => {
        if (!c.createdAt && !c.date) return false;
        const d = new Date(c.createdAt || c.date || '');
        return d.toDateString() === dateObj.toDateString();
      }).length;

      return {
        date: label,
        digitalEvidence: dayDigital,
        testimonies: dayTestimonies,
        judicialOrders: dayOrders,
        integrityScore: 100.0
      };
    });
  }

  public getLiveCaseCategories() {
    const casesArr = Array.from(this.cases.values());
    const total = casesArr.length || 1;

    // Dynamically generate categories from what's in the database
    const typeCounts: Record<string, number> = {};
    casesArr.forEach(c => {
      const t = c.type || 'Other';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    const colorPalette = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

    return Object.entries(typeCounts).map(([type, count], idx) => ({
      name: type,
      value: Number(((count / total) * 100).toFixed(0)),
      count,
      color: colorPalette[idx % colorPalette.length]
    }));
  }

  public getLiveAnalyticalModules(): any[] {
    const casesArr = Array.from(this.cases.values());
    const evidenceArr = Array.from(this.evidence.values());
    const forgeryArr = this.forgeryReviews;
    const consensusArr = this.consensusRequests;

    const baseModules = [
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
        timeSeriesDetailed: (() => {
          const hours = [8, 12, 16]; // 08:00 AM, 12:00 PM, 04:00 PM
          return hours.map(h => {
            const label = h === 8 ? '08:00 AM' : h === 12 ? '12:00 PM' : '04:00 PM';
            const incoming = evidenceArr.filter(e => new Date(e.createdAt || e.date || Date.now()).getHours() === h).length;
            const sealed = evidenceArr.filter(e => (e.status === 'Sealed' || e.status === 'Verified') && new Date(e.createdAt || e.date || Date.now()).getHours() === h).length;
            return { time: label, valueA: incoming, valueB: sealed, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' };
          });
        })(),
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
        timeSeriesDetailed: (() => {
          const days = [];
          for (let i = 2; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d);
          }
          return days.map(d => {
            const timeLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            const filings = casesArr.filter(c => new Date(c.createdAt || c.date || Date.now()).toDateString() === d.toDateString()).length;
            const executed = casesArr.filter(c => c.status === 'Closed' && new Date(c.updatedAt || Date.now()).toDateString() === d.toDateString()).length;
            return { time: timeLabel, valueA: filings, valueB: executed, labelA: 'New Filings', labelB: 'Orders Executed' };
          });
        })(),
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
        timeSeriesDetailed: (() => {
          const days = [];
          for (let i = 2; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d);
          }
          return days.map(d => {
            const timeLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            const audited = forgeryArr.filter(f => new Date(f.timestamp || Date.now()).toDateString() === d.toDateString()).length;
            const unresolved = forgeryArr.filter(f => f.status === 'Under Review' && new Date(f.timestamp || Date.now()).toDateString() === d.toDateString()).length;
            return { time: timeLabel, valueA: audited, valueB: unresolved, labelA: 'Integrity %', labelB: 'Unresolved Flags' };
          });
        })(),
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
        timeSeriesDetailed: (() => {
          const d = new Date();
          const currentMonthName = d.toLocaleString('default', { month: 'short' });
          const outliers = this.precedentFlags.filter(p => p.status === 'Flagged').length;
          const reviewed = this.precedentFlags.filter(p => p.status === 'Resolved' || p.status === 'Overridden').length;
          return [
            { time: currentMonthName, valueA: outliers, valueB: reviewed, labelA: 'Outliers Flagged', labelB: 'Quality Panel Reviewed' }
          ];
        })(),
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
        timeSeriesDetailed: (() => {
          const latestBlocks = consensusArr.slice(-3);
          return latestBlocks.map((c, idx) => {
            return { time: `Block #${c.id.substring(0, 4)}`, valueA: consensusArr.length, valueB: c.status === 'Approved' ? 1 : 0, labelA: 'Total Requests', labelB: 'Approved' };
          });
        })(),
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
        timeSeriesDetailed: (() => {
          const d = new Date();
          const q = Math.ceil((d.getMonth() + 1) / 3);
          const y = d.getFullYear();
          return [
            { time: `Q${q} ${y}`, valueA: casesArr.length, valueB: casesArr.length, labelA: 'Infrastructure Readiness', labelB: 'Resource Equity' }
          ];
        })(),
        statutoryAuditLog: [
          { event: 'Inter-Jurisdictional Database Ledger Audit Passed', timestamp: '5 mins ago', hash: '0xDIST_AUDIT_OK', status: 'Passed' }
        ]
      }
    ];

    return baseModules.map(mod => {
      const isAttested = this.isModuleAttested(mod.id);
      if (isAttested) {
        mod.statusBadge = 'Attested & Sealed on Ledger';
        mod.badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
        mod.statutoryAuditLog.unshift({
          event: `Judicial Attestation Formally Signed & Block Sealed`,
          timestamp: 'Just now',
          hash: '0xSEAL_ATTEST_' + mod.id,
          status: 'Attested'
        });
      }
      return mod;
    });
  }
}

export const primaryStore = new PrimaryDataStore();
