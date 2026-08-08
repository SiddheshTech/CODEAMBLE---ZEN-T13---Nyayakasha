import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import {
  ShieldCheck,
  LockKeyhole,
  Cpu,
  Key,
  Shield,
  EyeOff,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Server,
  FileKey,
  Binary,
  Layers,
  Fingerprint,
  RefreshCcw,
  Zap,
  Info,
  Terminal,
  Scale,
  GitCommit,
  Network,
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

interface SecurityPillar {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: any;
  badge: string;
  description: string;
  techSpecs: string[];
  threatPrevented: string;
}

const SECURITY_PILLARS: SecurityPillar[] = [
  {
    id: 'pqc',
    number: '01',
    title: 'Post-Quantum Cryptography (PQC)',
    subtitle: 'NIST Round 4 Standardized Lattice Algorithms',
    icon: LockKeyhole,
    badge: 'Quantum-Safe',
    description:
      'Standard RSA and ECC encryption will be vulnerable to quantum supercomputers using Shor’s Algorithm. Nyayakasha secures all digital evidence hashes and signatures using NIST-standardized lattice cryptography.',
    techSpecs: [
      'CRYSTALS-Dilithium & FALCON for post-quantum digital signatures',
      'CRYSTALS-Kyber 1024 for quantum-resistant key encapsulation (KEM)',
      'Hybrid classical + quantum wrapper ensuring backward compatibility',
      'Immutable SHA3-512 block header hashing'
    ],
    threatPrevented: 'Future quantum decryption of sealed evidence vaults and retrospective forgery attacks.'
  },
  {
    id: 'zkp',
    number: '02',
    title: 'Zero-Knowledge Privacy (zk-SNARKs)',
    subtitle: 'Verifiable Proofs Without Content Exposure',
    icon: EyeOff,
    badge: 'Zero-Knowledge',
    description:
      'Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs) allow judicial authorities to verify document integrity, witness statement consistency, and metadata validity without disclosing raw case contents.',
    techSpecs: [
      'Groth16 & PlonK proof systems over BN254 / BLS12-381 curves',
      'Private witness statement consistency checks across multiple police drafts',
      'Anonymous witness identity protection with verifiable credentials',
      'Zero-leakage compliance with DPDP Act 2023 & GDPR'
    ],
    threatPrevented: 'Data leaks during inter-agency evidence transfer and identity exposure of protected witnesses.'
  },
  {
    id: 'hardware',
    number: '03',
    title: 'Hardware Root of Trust & Secure Enclaves',
    subtitle: 'Tamper-Proof Capture at the Silicon Level',
    icon: Cpu,
    badge: 'Silicon Enclave',
    description:
      'Evidence integrity begins at the moment of capture. Using ARM TrustZone, Intel SGX, and WebAuthn hardware security keys, raw sensor data and camera frames are cryptographically signed before touching the OS.',
    techSpecs: [
      'ARM TrustZone secure OS isolation for mobile evidence capture',
      'Hardware-bound GPS, network time, and biometric binding',
      'WebAuthn / YubiKey 5 Series FIPS 140-2 Level 3 HSM authentication',
      'Anti-spoofing sensor validation rejecting software-generated mock photos'
    ],
    threatPrevented: 'OS-level malware, deepfake camera injection, and mobile device metadata manipulation.'
  },
  {
    id: 'fhe',
    number: '04',
    title: 'Fully Homomorphic Encryption (FHE)',
    subtitle: 'Computation Over Encrypted Dockets',
    icon: Binary,
    badge: 'Encrypted Compute',
    description:
      'Nyayakasha utilizes Microsoft SEAL and OpenFHE libraries to compute statistical analytics, case duration forecasts, and AI anomaly detection directly over encrypted files without requiring decryption keys.',
    techSpecs: [
      'CKKS & BFV homomorphic schemes for encrypted matrix computations',
      'AI anomaly detection over ciphertexts without exposing case details',
      'Zero-trust cloud analytics hosting on untrusted hardware',
      'Cryptographically blinded search over sealed court dockets'
    ],
    threatPrevented: 'Insider threats at cloud hosting providers and unauthorized data mining of sub-judice cases.'
  }
];

const ATTACK_SCENARIOS = [
  {
    id: 'deepfake',
    title: 'Deepfake & Photo Alteration Attack',
    threat: 'Adversary uses generative AI to modify a crime scene photograph before court submission.',
    mechanism: 'PRAMANA Hardware Enclave (Layer 1)',
    outcome: 'Rejected Immediately',
    description: 'The system computes the SHA-256 hash inside ARM TrustZone at capture. Any 1-pixel alteration changes the hash, breaking the blockchain anchor and raising an instant forgery flag.',
    statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'quantum',
    title: 'Quantum Harvest-Now-Decrypt-Later Attack',
    threat: 'Nation-state intercepts encrypted court records today to decrypt them when quantum computers mature.',
    mechanism: 'CRYSTALS-Kyber Lattice KEM (Layer 2)',
    outcome: 'Decryption Impossible',
    description: 'All dockets are wrapped in post-quantum lattice primitives. Solving the Shortest Vector Problem (SVP) remains computationally infeasible even for 10,000-qubit quantum computers.',
    statusColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    id: 'witness',
    title: 'Witness Intimidation / Identity Exposure',
    threat: 'Malicious insider attempts to leak witness identities during cross-examination file sharing.',
    mechanism: 'zk-SNARK Anonymous Credentials (Layer 3)',
    outcome: 'Zero Exposure',
    description: 'The court verifies that the statement was given by an authenticated witness using a zero-knowledge range proof without revealing the witness’s legal name, photo, or address.',
    statusColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    id: 'insider',
    title: 'Rogue Database Admin Record Deletion',
    threat: 'A compromised database administrator attempts to delete or alter a high-profile case docket.',
    mechanism: 'BFT Multi-Party Quorum Consensus (Layer 4)',
    outcome: 'Tamper-Evident Rollback',
    description: 'No single administrator possesses write authority. Altering a ledger record requires a 3-of-5 signed consensus vote across independent judicial nodes. Any unilateral edit is rejected.',
    statusColor: 'bg-slate-900 text-white border-slate-800'
  }
];

interface SecurityFaq {
  id: string;
  category: string;
  question: string;
  answer: string;
  keyTakeaways: string[];
}

const SECURITY_FAQS: SecurityFaq[] = [
  {
    id: 'storage',
    category: 'Data Storage & Encryption',
    question: 'How is evidence data stored and encrypted at rest?',
    answer:
      'All physical evidence files—including 4K scene photographs, audio recordings, ballistic logs, and digital dockets—are stored using Zero-Knowledge envelope encryption. Raw payloads are encrypted with unique AES-256-GCM symmetric keys, which are immediately wrapped using NIST CRYSTALS-Kyber 1024 post-quantum key encapsulation. Ciphertext remains stored across geographically isolated, air-gapped sovereign cloud nodes while cryptographic hashes and Merkle proofs reside on the BFT ledger.',
    keyTakeaways: [
      'AES-256-GCM payload encryption with unique per-file keys',
      'CRYSTALS-Kyber 1024 post-quantum wrapper prevents key cracking',
      'Geographically split sovereign nodes with air-gapped HSM key storage'
    ]
  },
  {
    id: 'zkp-explain',
    category: 'Privacy & Cryptography',
    question: 'What is a Zero-Knowledge Proof (zk-SNARK), and why is it used?',
    answer:
      'A Zero-Knowledge Proof is a mathematical cryptographic mechanism that allows one party (e.g., a field investigator or witness) to prove to another party (e.g., a presiding judge or defense counsel) that a statement is 100% valid without disclosing the underlying raw data. In Nyayakasha, zk-SNARKs allow courts to verify witness authenticity, document submission timestamps, and chain-of-custody continuity without exposing protected witness names, home addresses, or sealed case dockets to unauthorized parties.',
    keyTakeaways: [
      'Verifies evidence validity without revealing sensitive raw content',
      'Protects witness identity and confidential informant records',
      'Ensures full compliance with the DPDP Act 2023 and GDPR privacy rules'
    ]
  },
  {
    id: 'quantum-explain',
    category: 'Post-Quantum Preparedness',
    question: 'What does "Quantum-Safe Architecture" mean for legal records?',
    answer:
      'Current public-key encryption standards like RSA-2048 and Elliptic Curve Cryptography (ECC) will become vulnerable when quantum supercomputers running Shor’s algorithm mature. Adversaries today engage in "Harvest-Now, Decrypt-Later" attacks—intercepting encrypted high-profile case files to decrypt them in the future. Nyayakasha replaces classical algorithms with NIST-standardized lattice cryptography (CRYSTALS-Kyber and CRYSTALS-Dilithium), making mathematical decryption impossible even for 10,000-qubit quantum systems.',
    keyTakeaways: [
      'Defends against "Harvest-Now, Decrypt-Later" nation-state interception',
      'NIST Round 4 standardized lattice-based mathematical algorithms',
      'Dual classical + quantum hybrid signatures for seamless backward compatibility'
    ]
  },
  {
    id: 'tamper-explain',
    category: 'Access Control & Consensus',
    question: 'Can a rogue database admin or cloud hosting provider alter or delete a case file?',
    answer:
      'No. Nyayakasha operates on a zero-trust multi-party Byzantine Fault Tolerant (BFT) consensus architecture. No individual administrator, court clerk, or cloud hosting technician possesses unilateral write or delete privileges. Any proposed state change or evidence deletion requires signed consensus from a 3-of-5 quorum of independent judicial validator nodes (including High Courts, state forensic labs, and the Supreme Court anchor). Any unapproved local database edit is rejected by the network and automatically rolled back.',
    keyTakeaways: [
      'Zero single-point-of-failure or admin override capability',
      '3-of-5 BFT quorum consensus required for all state transitions',
      'Automated state rollback upon detection of unauthorized edits'
    ]
  },
  {
    id: 'hardware-explain',
    category: 'Hardware Root of Trust',
    question: 'How does hardware-level root of trust prevent deepfakes and spoofed evidence?',
    answer:
      'Evidence integrity is locked at the instant of capture. When an investigator takes a photograph or records an interview using Nyayakasha field tools, cryptographic hashing occurs directly within the hardware secure enclave (ARM TrustZone / Intel SGX) before the media file ever touches the device operating system. The sensor hash, hardware serial number, GPS location, and atomic time are cryptographically bound together, rendering software-based deepfake injection or metadata spoofing completely impossible.',
    keyTakeaways: [
      'Silicon-level capture isolated inside ARM TrustZone & Intel SGX',
      'Tamper-proof binding of GPS, network timestamp, and hardware biometrics',
      'Blocks OS malware, synthetic media injection, and photo modification'
    ]
  },
  {
    id: 'section65b-explain',
    category: 'Statutory Admissibility',
    question: 'How does Nyayakasha satisfy Section 65B of the Indian Evidence Act?',
    answer:
      'Section 65B requires strict proof of electronic record conditions, device operational integrity, and custody timeline. Nyayakasha automatically compiles an immutable Section 65B Compliance Certificate for every submitted evidence file. This certificate bundles the raw cryptographic hash, hardware enclave signature, BFT node timestamps, and Merkle tree root proof, generating court-admissible documentation instantly without requiring manual IT affidavit creation.',
    keyTakeaways: [
      'Instant automated generation of Section 65B electronic certificates',
      'Includes cryptographic proof of device integrity and custody logs',
      'Accepted directly across High Courts and the Supreme Court of India'
    ]
  }
];

const EVIDENCE_HASH_SAMPLES = [
  {
    id: 'photo',
    title: 'Crime Scene Photo (4K Raw)',
    docket: 'DOCKET-CR-2026-9041',
    hash: '0x8f3a92b7c4d1e0892f4a10c8e2b7a9f14e320892a019482759102c81e289f91a',
    merkleRoot: '0x4e8201a...998f',
    bytes: '18.4 MB',
    captureTime: 'Today, 08:14:22 IST',
    nodeVerificationFlow: [
      { stage: '1. Enclave Capture', latencyMs: 2.1, confidence: 100, consensusPct: 100, bytesTransferred: 512 },
      { stage: '2. PQC KEM Wrapping', latencyMs: 5.4, confidence: 100, consensusPct: 100, bytesTransferred: 1024 },
      { stage: '3. ZK Proof Gen', latencyMs: 12.8, confidence: 100, consensusPct: 100, bytesTransferred: 288 },
      { stage: '4. Node BFT Quorum', latencyMs: 18.2, confidence: 100, consensusPct: 100, bytesTransferred: 2048 },
      { stage: '5. Ledger Anchor', latencyMs: 24.5, confidence: 100, consensusPct: 100, bytesTransferred: 128 },
    ],
    nodeStatus: [
      { name: 'High Court Node (Mumbai)', latency: 3.8, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Forensics Lab (New Delhi)', latency: 6.2, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Validator Node (Bengaluru)', latency: 7.9, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Cyber Precinct (Hyderabad)', latency: 9.1, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Supreme Anchor (New Delhi)', latency: 3.1, status: 'VERIFIED', score: 100, fill: '#10B981' },
    ]
  },
  {
    id: 'audio',
    title: 'Wiretap Audio Recording (PCM)',
    docket: 'DOCKET-EV-2026-4029',
    hash: '0x3c71a9f02e8d9104b2a8f7129c018247f901248912e749a029f812401829a4b2',
    merkleRoot: '0x991f82c...210a',
    bytes: '42.1 MB',
    captureTime: 'Today, 06:45:00 IST',
    nodeVerificationFlow: [
      { stage: '1. Enclave Capture', latencyMs: 3.0, confidence: 100, consensusPct: 100, bytesTransferred: 512 },
      { stage: '2. PQC KEM Wrapping', latencyMs: 6.8, confidence: 100, consensusPct: 100, bytesTransferred: 1024 },
      { stage: '3. ZK Proof Gen', latencyMs: 15.2, confidence: 100, consensusPct: 100, bytesTransferred: 288 },
      { stage: '4. Node BFT Quorum', latencyMs: 21.0, confidence: 100, consensusPct: 100, bytesTransferred: 2048 },
      { stage: '5. Ledger Anchor', latencyMs: 28.1, confidence: 100, consensusPct: 100, bytesTransferred: 128 },
    ],
    nodeStatus: [
      { name: 'High Court Node (Mumbai)', latency: 4.1, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Forensics Lab (New Delhi)', latency: 5.8, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Validator Node (Bengaluru)', latency: 8.4, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Cyber Precinct (Hyderabad)', latency: 8.8, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Supreme Anchor (New Delhi)', latency: 2.9, status: 'VERIFIED', score: 100, fill: '#10B981' },
    ]
  },
  {
    id: 'dna',
    title: 'Ballistics & DNA Specimen Log',
    docket: 'DOCKET-DOC-2026-1182',
    hash: '0xe12b489c071d82f9104b827f01248912e749a029f812401829f812401829f803',
    merkleRoot: '0x102f88a...443e',
    bytes: '3.8 MB',
    captureTime: 'Yesterday, 22:10:00 IST',
    nodeVerificationFlow: [
      { stage: '1. Enclave Capture', latencyMs: 1.8, confidence: 100, consensusPct: 100, bytesTransferred: 512 },
      { stage: '2. PQC KEM Wrapping', latencyMs: 4.2, confidence: 100, consensusPct: 100, bytesTransferred: 1024 },
      { stage: '3. ZK Proof Gen', latencyMs: 9.9, confidence: 100, consensusPct: 100, bytesTransferred: 288 },
      { stage: '4. Node BFT Quorum', latencyMs: 14.6, confidence: 100, consensusPct: 100, bytesTransferred: 2048 },
      { stage: '5. Ledger Anchor', latencyMs: 19.8, confidence: 100, consensusPct: 100, bytesTransferred: 128 },
    ],
    nodeStatus: [
      { name: 'High Court Node (Mumbai)', latency: 2.9, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Forensics Lab (New Delhi)', latency: 4.5, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Validator Node (Bengaluru)', latency: 6.1, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Cyber Precinct (Hyderabad)', latency: 7.2, status: 'VERIFIED', score: 100, fill: '#10B981' },
      { name: 'Supreme Anchor (New Delhi)', latency: 2.1, status: 'VERIFIED', score: 100, fill: '#10B981' },
    ]
  }
];

export function SecurityPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [activePillar, setActivePillar] = useState<string>('pqc');
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeHashId, setActiveHashId] = useState<string>('photo');
  const [openFaqId, setOpenFaqId] = useState<string | null>('storage');

  const selectedPillar = SECURITY_PILLARS.find((p) => p.id === activePillar) || SECURITY_PILLARS[0];
  const activeHashSample = EVIDENCE_HASH_SAMPLES.find((s) => s.id === activeHashId) || EVIDENCE_HASH_SAMPLES[0];

  const handleSimulateNext = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setActiveScenario((prev) => (prev + 1) % ATTACK_SCENARIOS.length);
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] font-sans">
      {/* 1. HERO SECTION */}
      <div className="pt-12 md:pt-20 pb-16 px-6">
        <div className="max-w-[88rem] mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 text-black/80 text-xs font-semibold tracking-widest uppercase mb-6 border border-black/10">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sovereign Security Standard</span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-medium leading-none mb-6 text-black tracking-tight max-w-5xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            Post-Quantum &amp; Zero-Knowledge Security
          </h1>

          <p className="text-black/70 text-lg md:text-xl leading-relaxed max-w-3xl mb-10 font-normal">
            Engineered to safeguard state judicial dockets, forensic evidence chains, and protected witness identities against current cyber threats and future quantum decryption.
          </p>

          {/* Quick Security KPI Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs flex flex-col items-center text-center">
              <LockKeyhole className="w-6 h-6 text-black mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Quantum Standard</span>
              <span className="text-sm font-semibold text-black mt-1">NIST Kyber &amp; Dilithium</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs flex flex-col items-center text-center">
              <EyeOff className="w-6 h-6 text-black mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Privacy Proofs</span>
              <span className="text-sm font-semibold text-black mt-1">zk-SNARKs &amp; PlonK</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs flex flex-col items-center text-center">
              <Cpu className="w-6 h-6 text-black mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Hardware Root</span>
              <span className="text-sm font-semibold text-black mt-1">ARM TrustZone &amp; HSM</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs flex flex-col items-center text-center">
              <Binary className="w-6 h-6 text-black mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-black/50">Encrypted Compute</span>
              <span className="text-sm font-semibold text-black mt-1">Microsoft SEAL FHE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 4 PILLARS OF CRYPTOGRAPHIC DEFENSE */}
      <div className="px-6 py-16 bg-white border-y border-black/5">
        <div className="max-w-[88rem] mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-black/50 block mb-2">
                Defense-in-Depth
              </span>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-black" style={{ letterSpacing: '-0.02em' }}>
                Four Pillars of Sovereign Defense
              </h2>
            </div>
            <p className="text-black/60 text-base max-w-md">
              Each layer operates independently and synergistically to ensure no single point of failure across the entire judicial lifecycle.
            </p>
          </div>

          {/* Pillar Selector Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {SECURITY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const isSelected = activePillar === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-lg'
                      : 'bg-[#F9F9F9] text-black border-black/5 hover:border-black/20 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-black/60'}`}>
                      {pillar.number}
                    </span>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-black/70'}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight mt-4">{pillar.title}</h3>
                    <p className={`text-xs mt-1 font-medium ${isSelected ? 'text-white/70' : 'text-black/50'}`}>
                      {pillar.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pillar Active Detail Card */}
          <motion.div
            key={selectedPillar.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#0A0A0A] text-white p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pillar {selectedPillar.number}: {selectedPillar.badge}</span>
              </div>

              <h3 className="text-3xl font-medium tracking-tight text-white">{selectedPillar.title}</h3>
              <p className="text-white/70 text-base leading-relaxed">{selectedPillar.description}</p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Technical Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPillar.techSpecs.map((spec, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-white/80 font-medium bg-white/5 p-3 rounded-xl border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Threat Mitigated</span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  {selectedPillar.threatPrevented}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/50 font-mono">Status: Active Sovereign Protocol</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2.5 CRYPTOGRAPHIC HASH VERIFICATION FLOW & NETWORK NODES (RECHARTS INTEGRATION) */}
      <div className="px-6 py-20 bg-[#0A0A0A] text-white border-b border-white/10">
        <div className="max-w-[88rem] mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">
                <Network className="w-3.5 h-3.5" />
                <span>Visual Cryptographic Architecture</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white" style={{ letterSpacing: '-0.03em' }}>
                Evidence Hash Verification Across Network Nodes
              </h2>
            </div>
            <p className="text-white/60 text-sm md:text-base max-w-xl">
              Mapping real-time hash generation, post-quantum KEM encapsulation, zero-knowledge proof generation, and BFT multi-party consensus across state judicial validator nodes.
            </p>
          </div>

          {/* Interactive Evidence Docket Selector */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-white/40 block">Select Active Evidence Docket To Map Verification Flow</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EVIDENCE_HASH_SAMPLES.map((sample) => {
                const isSelected = activeHashSample.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => setActiveHashId(sample.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-xl'
                        : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-black/10 text-black' : 'bg-white/10 text-white/80'}`}>
                        {sample.docket}
                      </span>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${isSelected ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        <Check className="w-3.5 h-3.5" /> Hash Validated
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold">{sample.title}</h3>
                      <p className={`text-xs font-mono mt-1 truncate ${isSelected ? 'text-black/60' : 'text-white/50'}`}>
                        {sample.hash}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-black/10">
                      <span className={isSelected ? 'text-black/60' : 'text-white/40'}>Captured: {sample.captureTime}</span>
                      <span className={`font-mono font-bold ${isSelected ? 'text-black/80' : 'text-white/70'}`}>{sample.bytes}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recharts Diagrams Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chart 1: Verification Pipeline Latency & Quorum Confidence (7 cols) */}
            <div className="lg:col-span-7 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Stage-by-Stage Verification Pipeline Latency</span>
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Accumulative execution time (ms) and 100% consensus quorum reached across verification stages.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Total Latency: {activeHashSample.nodeVerificationFlow[4].latencyMs} ms</span>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeHashSample.nodeVerificationFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="stage"
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                      unit=" ms"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        borderColor: '#27272A',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: any) => [
                        `${value} ms`,
                        name === 'latencyMs' ? 'Execution Latency' : name
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="latencyMs"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#latencyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stage Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/10 text-center">
                {activeHashSample.nodeVerificationFlow.map((st, idx) => (
                  <div key={idx} className="bg-white/5 p-2 rounded-xl text-left">
                    <span className="text-[10px] font-mono text-emerald-400 block font-bold">STAGE 0{idx+1}</span>
                    <span className="text-[11px] font-medium text-white/90 block truncate">{st.stage.split('. ')[1]}</span>
                    <span className="text-[10px] text-white/50 font-mono mt-0.5 block">{st.latencyMs} ms</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Distributed Validator Node Latency & Status (5 cols) */}
            <div className="lg:col-span-5 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Node Hash Consensus Response (ms)</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Simultaneous verification ping across 5 judicial quorum validator nodes.
                </p>
              </div>

              {/* Recharts Bar Chart */}
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeHashSample.nodeStatus} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} unit=" ms" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 10 }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        borderColor: '#27272A',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`${val} ms`, 'Ping Latency']}
                    />
                    <Bar dataKey="latency" radius={[0, 8, 8, 0]}>
                      {activeHashSample.nodeStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Merkle Root & Cryptographic Proof Verification Card */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/50">Merkle Root Anchor:</span>
                  <span className="text-emerald-400 font-bold">{activeHashSample.merkleRoot}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/50">BFT Consensus Quorum:</span>
                  <span className="text-white font-bold">5 of 5 Nodes Signed (100%)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-white/10">
                  <span className="text-white/50">Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> IMMUTABLE &amp; VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE THREAT & DEFENSE SIMULATOR */}
      <div className="px-6 py-20">
        <div className="max-w-[88rem] mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-black/50">Live Verification Engine</span>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-black" style={{ letterSpacing: '-0.02em' }}>
              Simulate Real-World Attack Scenarios
            </h2>
            <p className="text-black/60 text-base">
              Test how Nyayakasha’s cryptographic architecture defends against modern state-level cyber threats.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 shadow-xl p-6 sm:p-10 space-y-8">
            {/* Scenario Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-mono font-bold text-sm">
                  0{activeScenario + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">{ATTACK_SCENARIOS[activeScenario].title}</h3>
                  <span className="text-xs text-black/50 font-medium">Scenario {activeScenario + 1} of {ATTACK_SCENARIOS.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSimulateNext}
                  disabled={isSimulating}
                  className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Testing Defense...' : 'Next Scenario'}</span>
                </button>
              </div>
            </div>

            {/* Scenario Active Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Attack Input */}
              <div className="lg:col-span-5 bg-rose-50/50 rounded-2xl p-6 border border-rose-100 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Adversary Attack Vector</span>
                  </div>
                  <p className="text-sm font-medium text-rose-950 leading-relaxed">
                    {ATTACK_SCENARIOS[activeScenario].threat}
                  </p>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-rose-200/60 text-xs font-mono text-rose-900">
                  <span>Attack Method: Unilateral Payload Injection / Spoofing</span>
                </div>
              </div>

              {/* Right Column: Defense Execution */}
              <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Nyayakasha Defense Triggered
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ATTACK_SCENARIOS[activeScenario].statusColor}`}>
                      {ATTACK_SCENARIOS[activeScenario].outcome}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {ATTACK_SCENARIOS[activeScenario].mechanism}
                  </h4>

                  <p className="text-sm text-white/80 leading-relaxed font-normal">
                    {ATTACK_SCENARIOS[activeScenario].description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
                  <span>Cryptographic Proof: PASS</span>
                  <span>Latency: &lt; 12ms</span>
                </div>
              </div>
            </div>

            {/* Scenario Navigation Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {ATTACK_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(idx)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    activeScenario === idx
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-black/5 text-black/60 hover:bg-black/10'
                  }`}
                >
                  {idx + 1}. {sc.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMPLIANCE & SOVEREIGN CERTIFICATIONS */}
      <div className="px-6 py-16 bg-white border-t border-black/5">
        <div className="max-w-[88rem] mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-black/50">Regulatory Alignment</span>
            <h2 className="text-3xl font-medium tracking-tight text-black" style={{ letterSpacing: '-0.02em' }}>
              Judicial &amp; Statutory Compliance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F9F9F9] border border-black/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-black">Section 65B Electronic Evidence</h3>
              <p className="text-xs text-black/60 leading-relaxed">
                Automates the generation of Section 65B compliance certificates with cryptographic hash proofs acceptable in High Courts and the Supreme Court.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F9F9F9] border border-black/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-black">CERT-In High Security Audited</h3>
              <p className="text-xs text-black/60 leading-relaxed">
                Formally audited by empaneled cybersecurity auditors for zero-day vulnerabilities, air-gapped HSM operations, and safe memory handling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F9F9F9] border border-black/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <FileKey className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-black">DPDP Act 2023 &amp; GDPR Compliant</h3>
              <p className="text-xs text-black/60 leading-relaxed">
                Zero-Knowledge masking guarantees that personal data is never stored unencrypted or exposed without explicit statutory court orders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4.5 EXPLAIN SECURITY (ACCORDION SECTION) */}
      <div className="px-6 py-20 bg-[#F5F5F5] border-t border-black/5">
        <div className="max-w-[88rem] mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 text-black/80 text-xs font-semibold tracking-widest uppercase border border-black/10">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Technical FAQ &amp; Architecture Guide</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black" style={{ letterSpacing: '-0.03em' }}>
              Explain Security: Technical Deep Dive
            </h2>
            <p className="text-black/60 text-base md:text-lg leading-relaxed">
              Addressing key engineering and legal questions regarding data storage, cryptographic zero-knowledge proofs, post-quantum resilience, and statutory compliance.
            </p>
          </div>

          {/* Accordion List */}
          <div className="max-w-4xl mx-auto space-y-4">
            {SECURITY_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-black/20 shadow-md ring-1 ring-black/5'
                      : 'bg-white/80 hover:bg-white border-black/5 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="space-y-1.5 pr-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 inline-block mb-1">
                        {faq.category}
                      </span>
                      <h3 className="text-lg font-semibold text-black leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className={`p-2 rounded-full transition-colors shrink-0 mt-1 ${isOpen ? 'bg-black text-white' : 'bg-black/5 text-black/60'}`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-black/5 space-y-4">
                          <p className="text-sm text-black/70 leading-relaxed font-normal">
                            {faq.answer}
                          </p>

                          <div className="bg-[#F9F9F9] p-4 rounded-xl border border-black/5 space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-black/50 block">Key Technical Takeaways</span>
                            <div className="space-y-1.5">
                              {faq.keyTakeaways.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-black/80 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. CALL TO ACTION SECTION */}
      <div className="px-6 py-20">
        <div className="max-w-[88rem] mx-auto bg-[#0A0A0A] text-white rounded-3xl p-10 md:p-16 text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Sovereign Security Audit</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white" style={{ letterSpacing: '-0.03em' }}>
              Deploy Quantum-Safe Security for Your Judiciary
            </h2>

            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              Connect with our cybersecurity engineers and post-quantum researchers to review our source audits and schedule a pilot deployment.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate?.('contact')}
                className="w-full sm:w-auto bg-white text-black text-base font-medium px-8 py-3.5 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Contact Security Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate?.('infrastructure')}
                className="w-full sm:w-auto bg-white/10 text-white text-base font-medium px-8 py-3.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer border border-white/15"
              >
                <span>Explore Infrastructure Layer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
