import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Building2, Scale, Calendar, FileText, CheckCircle2, RotateCw, ShieldCheck, Database, FileDigit, Link, FileKey, Library, Vault, Target, Users, ServerOff, EyeOff, Activity, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

function TypewriterText({ text, active }: { text: string; active: boolean }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!active) {
      setDisplayedText(text);
      return;
    }
    
    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(intervalId);
    }, 15); // typing speed
    
    return () => clearInterval(intervalId);
  }, [text, active]);

  return <>{displayedText}{active && displayedText.length < text.length && <span className="inline-block w-1 h-3 ml-0.5 bg-black/40 animate-pulse" />}</>;
}

const workflows = [
  // Litigation
  {
    id: 'plaint-drafting',
    icon: <Scale className="w-5 h-5" />,
    title: 'Plaint & Pleading Drafting',
    subtitle: 'Litigation',
    tag: 'Litigation',
    steps: [
      { id: 1, name: 'Intake', desc: 'Case facts & documents ingested', content: 'Extracting key facts from client brief...' },
      { id: 2, name: 'Benchmark', desc: 'Auto-benchmarking vs Precedent Twin', content: 'Layer 6: Correlating with historical fact patterns.' },
      { id: 3, name: 'Probability', desc: 'Probability-weighted argument shaping', content: 'Analyzing resolution probabilities for lead arguments.' },
      { id: 4, name: 'Draft', desc: 'Generating pleadings', content: 'Drafting core claims and precedent citations.' },
      { id: 5, name: 'Finalize', desc: 'Draft ready with insights', content: 'Draft complete. Probability scoring attached.' }
    ]
  },
  {
    id: 'judgment-summary',
    icon: <FileText className="w-5 h-5" />,
    title: 'Judgment Summary & Digest',
    subtitle: 'Litigation',
    tag: 'Litigation',
    steps: [
      { id: 1, name: 'Ingest', desc: 'Summarizing incoming judgments', content: 'Reading 120-page High Court order...' },
      { id: 2, name: 'Rank', desc: 'Ranking relevance to open matters', content: 'Cross-referencing with active firm dockets.' },
      { id: 3, name: 'Hash', desc: 'Applying PRAMANA hash (Layer 1)', content: 'Layer 1: Anchoring source judgment text.' },
      { id: 4, name: 'Digest', desc: 'Digest generated', content: 'Summary ready with immutable source proof.' }
    ]
  },
  {
    id: 'evidence-vault',
    icon: <Database className="w-5 h-5" />,
    title: 'Evidence Chain-of-Custody',
    subtitle: 'Litigation',
    tag: 'Litigation',
    steps: [
      { id: 1, name: 'Receive', desc: 'Client hands over materials', content: 'Ingesting forensic photos and communications.' },
      { id: 2, name: 'Hash', desc: 'Hash-anchoring at receipt', content: 'Layer 1: Cryptographic timestamping of all files.' },
      { id: 3, name: 'Store', desc: 'Establishing cryptographic proof', content: 'Immutable record of exact versions received.' },
      { id: 4, name: 'Vault', desc: 'Secured for verification', content: 'Vault locked. Chain-of-custody guaranteed.' }
    ]
  },
  {
    id: 'witness-consistency',
    icon: <FileDigit className="w-5 h-5" />,
    title: 'Witness Consistency Log',
    subtitle: 'Litigation',
    tag: 'Litigation',
    steps: [
      { id: 1, name: 'Intake', desc: 'Witness statement rounds ingested', content: 'Loading Draft v1 through v4...' },
      { id: 2, name: 'Analyze', desc: 'Cross-referencing drafts internally', content: 'Mapping semantic drift across statements.' },
      { id: 3, name: 'Prove', desc: 'Generating ZK-testimony proofs', content: 'Layer 3: Building zero-knowledge consistency proof.' },
      { id: 4, name: 'Verify', desc: 'Consistency verified', content: 'Internal consistency proven without exposing draft history.' }
    ]
  },
  
  // Corporate & Commercial
  {
    id: 'contract-forgery',
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Contract Review + Forgery',
    subtitle: 'Corporate & Commercial',
    tag: 'Corporate',
    steps: [
      { id: 1, name: 'Ingest', desc: 'High-value agreement loaded', content: 'Initializing standard clause-review...' },
      { id: 2, name: 'MAYA-BREAK', desc: 'Layer 2 forgery screening', content: 'Layer 2: Scanning for digitally spliced signature pages.' },
      { id: 3, name: 'Scan', desc: 'Checking execution marks', content: 'Verifying stamp duty marks and backdated execution.' },
      { id: 4, name: 'Report', desc: 'Screening complete', content: 'Review complete. No digital anomalies detected.' }
    ]
  },
  {
    id: 'execution-certification',
    icon: <Building2 className="w-5 h-5" />,
    title: 'Execution Certification',
    subtitle: 'Corporate & Commercial',
    tag: 'Corporate',
    steps: [
      { id: 1, name: 'Finalize', desc: 'Contract finalized and signed', content: 'Detecting execution signatures...' },
      { id: 2, name: 'Hash', desc: 'Clause-level hash-anchoring', content: 'Layer 1: Anchoring executed clauses.' },
      { id: 3, name: 'Certify', desc: 'Immutable timestamp generated', content: 'Generating cryptographic proof of execution.' },
      { id: 4, name: 'Secure', desc: 'Dispute-proof copy secured', content: 'Final executed version locked and verifiable.' }
    ]
  },

  // Banking & Finance
  {
    id: 'covenant-tracker',
    icon: <Link className="w-5 h-5" />,
    title: 'Covenant Tracker',
    subtitle: 'Banking & Finance',
    tag: 'Finance',
    steps: [
      { id: 1, name: 'Track', desc: 'Tracking financial covenants', content: 'Monitoring leverage ratios and reporting deadlines.' },
      { id: 2, name: 'Monitor', desc: 'Detecting events', content: 'Waiver event detected for Q3 reporting.' },
      { id: 3, name: 'Hash', desc: 'Hash-anchoring event', content: 'Layer 1: Anchoring waiver event to ledger.' },
      { id: 4, name: 'Audit', desc: 'Verifiable trail created', content: 'Tamper-proof audit trail ready for lender review.' }
    ]
  },
  {
    id: 'collateral-auth',
    icon: <Briefcase className="w-5 h-5" />,
    title: 'Collateral Authentication',
    subtitle: 'Banking & Finance',
    tag: 'Finance',
    steps: [
      { id: 1, name: 'Ingest', desc: 'Pledged collateral received', content: 'Loading title deeds and share certificates...' },
      { id: 2, name: 'MAYA-BREAK', desc: 'Layer 2 authentication', content: 'Layer 2: Running pixel-level fraud detection.' },
      { id: 3, name: 'Analyze', desc: 'Catching forged documents', content: 'Cross-referencing property documents against patterns.' },
      { id: 4, name: 'Authenticate', desc: 'Collateral cleared', content: 'Due diligence complete. Cleared for loan disbursement.' }
    ]
  },

  // Corporate & Compliance
  {
    id: 'compliance-proof',
    icon: <Calendar className="w-5 h-5" />,
    title: 'Filing Proof Calendar',
    subtitle: 'Corporate & Compliance',
    tag: 'Compliance',
    steps: [
      { id: 1, name: 'Track', desc: 'Tracking regulatory deadlines', content: 'Monitoring ROC and SEBI disclosure deadlines.' },
      { id: 2, name: 'Submit', desc: 'Filing submitted', content: 'ROC filing submission confirmed.' },
      { id: 3, name: 'Hash', desc: 'Hash-anchoring proof', content: 'Layer 1: Anchoring submission timestamp.' },
      { id: 4, name: 'Verify', desc: 'Unforgeable timestamp secured', content: 'Cryptographic proof of filing timing secured.' }
    ]
  },
  {
    id: 'encrypted-benchmarking',
    icon: <FileKey className="w-5 h-5" />,
    title: 'Encrypted Benchmarking',
    subtitle: 'Corporate & Compliance',
    tag: 'Compliance',
    steps: [
      { id: 1, name: 'Encrypt', desc: 'Homomorphic encryption applied', content: 'Layer 4: Encrypting client compliance posture.' },
      { id: 2, name: 'Benchmark', desc: 'Cross-client analysis', content: 'Running pattern analysis across portfolio...' },
      { id: 3, name: 'Analyze', desc: 'Checking compliance posture', content: 'Comparing metrics without decrypting client data.' },
      { id: 4, name: 'Report', desc: 'Insights generated', content: 'Benchmarking report ready. Confidentiality maintained.' }
    ]
  },

  // Cross-Practice
  {
    id: 'precedent-strategy',
    icon: <Library className="w-5 h-5" />,
    title: 'Precedent Strategy Tool',
    subtitle: 'Cross-Practice (Firm-Wide)',
    tag: 'Cross-Practice',
    steps: [
      { id: 1, name: 'Ingest', desc: 'Matter details entered', content: 'Loading commercial dispute facts...' },
      { id: 2, name: 'Analyze', desc: 'Anomaly-detection running', content: 'Scanning historical precedent database.' },
      { id: 3, name: 'Predict', desc: 'Settle-vs-litigate calculations', content: 'Calculating statistical success probabilities.' },
      { id: 4, name: 'Strategy', desc: 'Enforceability predictor ready', content: 'Strategic insights and risk assessment generated.' }
    ]
  },
  {
    id: 'general-intake',
    icon: <Vault className="w-5 h-5" />,
    title: 'General Client Intake Vault',
    subtitle: 'Cross-Practice (Firm-Wide)',
    tag: 'Cross-Practice',
    steps: [
      { id: 1, name: 'Receive', desc: 'Intake document received', content: 'New matter documents uploaded by client.' },
      { id: 2, name: 'Hash', desc: 'Immutable record generated', content: 'Layer 1: Timestamping exact versions received.' },
      { id: 3, name: 'Vault', desc: 'Record secured', content: 'Creating "received exactly this, at this time" record.' },
      { id: 4, name: 'Complete', desc: 'Intake complete', content: 'Practice-agnostic intake logged safely.' }
    ]
  }
];

const threats = [
  {
    icon: <Users className="w-5 h-5 text-black" />,
    title: "The Corrupt Insider",
    desc: "A police officer, clerk, or official with legitimate system access who wants to alter or fabricate a record."
  },
  {
    icon: <Target className="w-5 h-5 text-black" />,
    title: "The Powerful Litigant",
    desc: "Someone with the resources to intimidate a witness, bribe an official, or hire forensic-grade forgery."
  },
  {
    icon: <ServerOff className="w-5 h-5 text-black" />,
    title: "The External Attacker",
    desc: "Someone trying to breach the system from outside (hacking the ledger, spoofing a device, exfiltrating data)."
  },
  {
    icon: <EyeOff className="w-5 h-5 text-black" />,
    title: "The Over-Collecting Platform",
    desc: "Even a well-intentioned system operator shouldn't be able to misuse data. Cryptography over access policy."
  }
];

const securityLayers = [
  {
    layer: "Layer 1",
    title: "PRAMANA (Evidence Genesis)",
    defendsAgainst: "The corrupt insider and the powerful litigant altering evidence after the fact.",
    howItWorks: [
      "The hash generation happens inside a secure enclave (ARM TrustZone), meaning even someone with full access to the device's operating system cannot intercept or alter the hash calculation.",
      "SHA-256 is a one-way, collision-resistant function: it's computationally infeasible to construct a different file that produces the same hash.",
      "The bundle (hash + GPS + timestamp + officer biometric signature) is submitted to the ledger within seconds, closing the 'window of opportunity'."
    ],
    risks: [
      "Hardware supply-chain compromise — if the secure enclave chip itself is compromised at manufacture.",
      "GPS spoofing — mitigated by combining GPS with network-tower triangulation.",
      "Compromised officer credential — shifts investigation to an auditable question."
    ],
    icon: <Database className="w-6 h-6 text-black" />
  },
  {
    layer: "Layer 2",
    title: "MAYA-BREAK (Forgery Detection)",
    defendsAgainst: "External and insider forgery — someone submitting altered or synthetic evidence.",
    howItWorks: [
      "This is a detection layer, not a prevention layer. It makes successful forgery statistically much harder.",
      "Three independent, uncorrelated checks (metadata forensics, GAN-fingerprint detection, document forensics) mean an attacker has to defeat all three simultaneously.",
      "Every check cross-references the PRAMANA hash where one exists."
    ],
    risks: [
      "Adversarial AI attacks — sophisticated attackers can craft images specifically designed to fool GAN-detection classifiers.",
      "Model drift — detection models degrade over time as generative AI improves; requires continuous retraining."
    ],
    icon: <ShieldCheck className="w-6 h-6 text-black" />
  },
  {
    layer: "Layer 3",
    title: "Zero-Knowledge Testimony",
    defendsAgainst: "Witness intimidation and retaliation — protecting identity without weakening evidentiary trust.",
    howItWorks: [
      "A zk-SNARK lets someone prove a mathematical statement is true without revealing anything except that it's true.",
      "The witness's device runs their private data through a cryptographic circuit that outputs a proof. The proof reveals only the specific claim being tested.",
      "The witness's real identity is separately encrypted and locked behind a smart contract that only unlocks given a valid judicial order."
    ],
    risks: [
      "Trusted setup risk — modern constructions (like PLONK or zk-STARKs) reduce or eliminate this requirement.",
      "Side-channel leakage — needs to be addressed through submission-timing obfuscation.",
      "Legal enforceability of the unlock condition — cryptography is only as strong as the judicial process."
    ],
    icon: <FileKey className="w-6 h-6 text-black" />
  },
  {
    layer: "Layer 4",
    title: "Homomorphic Judicial Analytics",
    defendsAgainst: "The platform operator itself becoming a data-exposure risk, and courts' legitimate refusal to share raw data.",
    howItWorks: [
      "Homomorphic encryption allows mathematical operations to be performed directly on encrypted numbers.",
      "Only the final aggregate output is decryptable, and only by a party holding the corresponding key — typically a judicial oversight body.",
      "This is a fundamentally different security model from 'we promise not to look' — it's 'we are mathematically incapable of looking'."
    ],
    risks: [
      "Computational cost as a security-availability tradeoff — homomorphic encryption is slow.",
      "Key-holder compromise — requires multi-party key management (threshold decryption).",
      "Inference attacks on aggregates — requires minimum cohort-size thresholds."
    ],
    icon: <Library className="w-6 h-6 text-black" />
  },
  {
    layer: "Layer 5",
    title: "DHARMA Consensus",
    defendsAgainst: "Any single actor unilaterally rewriting the ledger.",
    howItWorks: [
      "Byzantine Fault Tolerant by design: the system continues to function correctly as long as the dishonest nodes stay below the quorum threshold.",
      "Weighting validation rights across three independent stakeholder classes (court registry, bar council, citizen oversight).",
      "Sensitivity-scaled quorums mean the most consequential changes require the broadest consensus."
    ],
    risks: [
      "Validator collusion — if enough nodes across all three classes are compromised simultaneously.",
      "Sybil risk within a class — node admission needs to be tied to verified institutional or vetted-citizen identity."
    ],
    icon: <Vault className="w-6 h-6 text-black" />
  },
  {
    layer: "Layer 6",
    title: "Precedent Digital Twin",
    defendsAgainst: "Misuse risk — a model whose output could itself become a vector for bias or manipulation.",
    howItWorks: [
      "The model outputs a flag for human review only — never a binding action.",
      "Mitigated by not publishing the model's internal weighting publicly, and by periodic retraining.",
      "Requires active bias auditing of the training data itself as an ongoing security/integrity process."
    ],
    risks: [
      "Adversarial gaming risk — litigants shaping arguments to avoid triggering anomaly flags.",
      "Training data bias propagation — if historical judgments contain systemic bias, the model will treat that bias as 'normal'."
    ],
    icon: <Scale className="w-6 h-6 text-black" />
  }
];

function SecurityPhilosophy() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 mt-12 border-t border-black/10">
      <div className="mb-16">
        <h2 className=" text-4xl tracking-tight text-black sm:text-5xl mb-6">
          Security Philosophy
        </h2>
        <p className="font-sans text-lg text-black/60 max-w-3xl leading-relaxed">
          Before the mechanics, it matters who NYAYAKASHA is actually defending against, because that shapes every design decision. Every layer below is designed against a specific one (or combination) of these four threat models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {threats.map((threat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 border border-black/5">
              {threat.icon}
            </div>
            <h3 className="font-sans text-base font-bold text-black">{threat.title}</h3>
            <p className="font-sans text-sm text-black/60 leading-relaxed">
              {threat.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-24 relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-black/10 hidden md:block" />
        
        {securityLayers.map((layer, index) => (
          <motion.div 
            key={layer.layer}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start"
          >
            <div className="hidden md:flex relative z-10 w-16 shrink-0 justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border-2 border-black shadow-sm">
                {layer.icon}
              </div>
            </div>
            
            <div className="flex-1 rounded-3xl bg-white border border-black/10 shadow-sm p-6 md:p-12 w-full">
              <div className="md:hidden flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-black shadow-sm mb-6">
                {layer.icon}
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs font-bold tracking-widest text-black/40 uppercase">
                  {layer.layer}
                </span>
              </div>
              <h3 className=" text-3xl md:text-4xl text-black mb-8">
                {layer.title}
              </h3>
              
              <div className="mb-8">
                <h4 className="font-sans text-sm font-bold text-black uppercase tracking-wider mb-3">
                  Defends Against
                </h4>
                <p className="font-sans text-base text-black/70 leading-relaxed border-l-2 border-black/20 pl-4 py-1">
                  {layer.defendsAgainst}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h4 className="font-sans text-sm font-bold text-black uppercase tracking-wider mb-5 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-black/50" />
                    How it works
                  </h4>
                  <ul className="flex flex-col gap-4">
                    {layer.howItWorks.map((item, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/40 shrink-0" />
                        <span className="font-sans text-sm text-black/70 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-2xl bg-gray-50/50 p-6 border border-black/5">
                  <h4 className="font-sans text-sm font-bold text-black uppercase tracking-wider mb-5 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-black/50" />
                    Residual Risks
                  </h4>
                  <ul className="flex flex-col gap-4">
                    {layer.risks.map((item, i) => {
                      const [title, desc] = item.split(' — ');
                      return (
                        <li key={i} className="font-sans text-sm text-black/70 leading-relaxed">
                          <strong className="text-black/90 font-semibold">{title}</strong>
                          {desc && (
                            <>
                              <span className="mx-1 text-black/30">—</span>
                              {desc}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Cross-Cutting Security Properties */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col md:flex-row gap-8 md:gap-16 items-start mt-8"
          >
            <div className="hidden md:flex relative z-10 w-16 shrink-0 justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex-1 rounded-3xl bg-black text-white p-6 md:p-12 shadow-xl w-full">
              <div className="md:hidden flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white shadow-sm mb-6">
                <Shield className="w-5 h-5" />
              </div>
              
              <h3 className=" text-3xl md:text-4xl text-white mb-8">
                Cross-Cutting Security Properties
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-sans text-sm font-bold text-white/90 mb-3">No single point of decryption</h4>
                  <p className="font-sans text-sm text-white/60 leading-relaxed">
                    Across the whole protocol, no single party holds a key that alone can expose witness identity, decrypt case analytics, or approve a high-sensitivity ledger change.
                  </p>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-white/90 mb-3">Defense in depth</h4>
                  <p className="font-sans text-sm text-white/60 leading-relaxed">
                    Evidence integrity alone relies on three independent layers (hardware anchoring, forgery detection, consensus validation) — a failure in any one doesn't collapse the whole guarantee.
                  </p>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-white/90 mb-3">Post-quantum forward-compatibility</h4>
                  <p className="font-sans text-sm text-white/60 leading-relaxed">
                    Signature schemes are chosen specifically so that evidence considered legally binding today doesn't become forgeable a decade from now when quantum computing matures.
                  </p>
                </div>
              </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}

export function EvidencePage() {
  const [activeWorkflow, setActiveWorkflow] = useState('plaint-drafting');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const activeData = workflows.find(w => w.id === activeWorkflow) || workflows[4];

  useEffect(() => {
    setCurrentStepIndex(0);
    
    const timer = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= activeData.steps.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [activeWorkflow, activeData.steps.length]);

  return (
    <div className="flex-1 bg-[#F5F5F5] min-h-screen">
      <div className="pt-32 pb-24">
        <section className="w-full px-6 sm:px-8 lg:px-16">
          <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-12">
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-16">
              <div className="flex flex-col gap-6">
                <p className="font-sans text-sm font-medium uppercase tracking-widest text-black/60">
                  CUSTOM AI WORKFLOWS
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black leading-tight">
                  Built Around Your Organisation.
                </h2>
              </div>
              <div>
                <p className="font-sans text-lg leading-relaxed text-black/70">
                  Every firm has its own way of working. Nyayakasha is configured around those realities. We work with your team to understand existing processes and build solutions that fit naturally into your organisation.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl shadow-black/5">
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
                
                {/* Sidebar */}
                <div className="border-b border-black/10 lg:border-b-0 lg:border-r bg-gray-50/50">
                  <p className="px-5 pt-5 pb-2 font-sans text-xs font-semibold uppercase tracking-widest text-black/50">
                    Firm workflows
                  </p>
                  <div className="flex gap-4 overflow-x-auto p-4 lg:flex-col lg:overflow-y-auto lg:max-h-[600px] lg:p-4 lg:gap-6 scrollbar-hide">
                    {Array.from(new Set(workflows.map(w => w.subtitle))).map(subtitle => (
                      <div key={subtitle} className="flex gap-2 lg:flex-col lg:gap-1">
                        <p className="hidden px-2 pb-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-black/40 lg:block">
                          {subtitle}
                        </p>
                        {workflows.filter(w => w.subtitle === subtitle).map((workflow) => {
                          const isActive = activeWorkflow === workflow.id;
                          return (
                            <button
                              key={workflow.id}
                              onClick={() => setActiveWorkflow(workflow.id)}
                              className={`group flex min-w-[240px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 lg:min-w-0 ${
                                isActive
                                  ? 'border-black/10 bg-white shadow-sm'
                                  : 'border-transparent hover:bg-black/5'
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-black text-white'
                                    : 'bg-black/5 text-black group-hover:bg-white'
                                }`}
                              >
                                {workflow.icon}
                              </span>
                              <span className="flex flex-col">
                                <span className={`font-sans text-sm font-medium leading-tight ${isActive ? 'text-black' : 'text-black/80'}`}>
                                  {workflow.title}
                                </span>
                                <span className="font-sans text-xs mt-0.5 leading-tight text-black/50 lg:hidden">
                                  {workflow.subtitle}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-black/5">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-medium tracking-tight text-black">
                        {activeData.title}
                      </h3>
                      <span className="font-sans text-sm text-black/50 font-medium">
                        {activeData.steps.length} stages · {activeData.tag}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 overflow-hidden min-w-[130px] justify-center ${currentStepIndex >= activeData.steps.length ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-90'}`}
                      disabled={currentStepIndex < activeData.steps.length}
                      onClick={() => setCurrentStepIndex(0)}
                    >
                      {currentStepIndex >= activeData.steps.length ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <RotateCw className="w-4 h-4 animate-spin shrink-0" />
                      )}
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={currentStepIndex >= activeData.steps.length ? 'completed' : currentStepIndex}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3 }}
                          className="block whitespace-nowrap"
                        >
                          {currentStepIndex >= activeData.steps.length ? 'Completed' : activeData.steps[currentStepIndex].name}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeWorkflow}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 sm:p-8"
                    >
                      {/* Progress Bar Area */}
                      <div className="relative mb-12 h-16 max-w-2xl mx-auto hidden sm:block">
                        <div className="absolute top-4 h-1 -translate-y-1/2 rounded-full bg-black/10" style={{ left: '5%', right: '5%' }}></div>
                        <div 
                          className="absolute top-4 h-1 -translate-y-1/2 rounded-full bg-black transition-all duration-700 ease-in-out" 
                          style={{ left: '5%', width: `${(Math.min(currentStepIndex, activeData.steps.length - 1) / (activeData.steps.length - 1)) * 90}%` }}
                        ></div>
                        
                        <motion.span 
                          className={`absolute top-4 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ease-in-out ${currentStepIndex >= activeData.steps.length ? 'bg-green-500 shadow-[0_0_15px_4px_rgba(34,197,94,0.3)]' : 'bg-black shadow-[0_0_15px_4px_rgba(0,0,0,0.15)]'}`} 
                          style={{ left: `${5 + (Math.min(currentStepIndex, activeData.steps.length - 1) / (activeData.steps.length - 1)) * 90}%` }}
                          animate={currentStepIndex >= activeData.steps.length ? {} : { scale: [1, 1.2, 1], boxShadow: ['0 0 15px 4px rgba(0,0,0,0.15)', '0 0 25px 8px rgba(0,0,0,0.2)', '0 0 15px 4px rgba(0,0,0,0.15)'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        ></motion.span>
                        
                        {/* Steps */}
                        {activeData.steps.map((step, index) => {
                          const isCompleted = index < currentStepIndex;
                          const isCurrent = index === currentStepIndex || (currentStepIndex >= activeData.steps.length && index === activeData.steps.length - 1);
                          const position = `${5 + (index / (activeData.steps.length - 1)) * 90}%`;

                          return (
                            <div key={step.id}>
                              <span 
                                className={`absolute top-4 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-medium transition-colors duration-500 ${
                                  isCompleted && index < currentStepIndex - 1 || currentStepIndex >= activeData.steps.length ? 'bg-black text-white' : 
                                  isCompleted && index === currentStepIndex - 1 ? 'bg-black text-white' :
                                  isCurrent ? 'border-2 border-black bg-white text-black' : 
                                  'border-2 border-black/10 bg-white text-black/40'
                                }`} 
                                style={{ left: position }}
                              >
                                {isCompleted && index < currentStepIndex - 1 || currentStepIndex >= activeData.steps.length ? <CheckCircle2 className="w-5 h-5" /> : 
                                 isCompleted && index === currentStepIndex - 1 ? <CheckCircle2 className="w-5 h-5" /> :
                                 isCurrent ? <RotateCw className="w-4 h-4 animate-spin text-black" /> : 
                                 index + 1}
                              </span>
                              <span 
                                className={`absolute top-10 w-24 -translate-x-1/2 text-center font-sans text-xs font-medium transition-colors duration-500 ${
                                  isCompleted || isCurrent ? 'text-black' : 'text-black/40'
                                }`} 
                                style={{ left: position }}
                              >
                                {step.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Status Card */}
                      <div className="overflow-hidden rounded-xl border border-black/10 bg-gray-50/50 shadow-sm max-w-2xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 bg-white px-5 py-4">
                          <span className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/5 text-black">
                              <FileText className="w-5 h-5" />
                            </span>
                            <span className="flex flex-col gap-0.5">
                              <span className="text-base font-medium text-black">{activeData.title}</span>
                              <span className="font-sans text-xs text-black/60">Processing document for {activeData.subtitle}</span>
                            </span>
                          </span>
                          <span className={`flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 font-sans text-xs font-medium ${currentStepIndex >= activeData.steps.length ? 'text-green-600' : 'text-black/70'} shadow-sm`}>
                            {currentStepIndex >= activeData.steps.length ? (
                               <CheckCircle2 className="w-3 h-3" />
                            ) : (
                               <span className="h-2 w-2 rounded-full bg-black animate-pulse"></span>
                            )}
                            {currentStepIndex >= activeData.steps.length ? 'Completed' : 'In progress'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-2">
                          {/* Mock UI Element */}
                          <div className="relative h-[280px] flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-black/5 bg-gray-50/50 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-black/40" />
                                <span className="font-mono text-[10px] font-semibold tracking-wider text-black/50 uppercase">Neural_Extraction_Engine</span>
                              </div>
                              {currentStepIndex < activeData.steps.length && (
                                <div className="flex gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-black/40 animate-pulse" style={{ animationDelay: '0ms' }}></span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-black/40 animate-pulse" style={{ animationDelay: '150ms' }}></span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-black/40 animate-pulse" style={{ animationDelay: '300ms' }}></span>
                                </div>
                              )}
                            </div>
                            
                            <div className="relative flex-1 p-3 sm:p-5 overflow-hidden font-mono text-xs">
                              {/* Scanning Line */}
                              {currentStepIndex < activeData.steps.length && (
                                <motion.div 
                                  className="absolute left-0 right-0 h-[1px] bg-black/30 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                                  animate={{ top: ['0%', '100%', '0%'] }}
                                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                />
                              )}
                              
                              <div className="flex flex-col gap-4">
                                <AnimatePresence mode="popLayout">
                                  {[...activeData.steps].slice(0, currentStepIndex + 1).reverse().map((step) => {
                                    const actualIndex = activeData.steps.findIndex(s => s.id === step.id);
                                    const isCurrent = actualIndex === currentStepIndex && currentStepIndex < activeData.steps.length;
                                    
                                    return (
                                      <motion.div 
                                        key={step.id}
                                        layout
                                        initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        className="flex flex-col gap-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-black animate-pulse' : 'bg-black/20'}`} />
                                          <span className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-widest">{step.name}</span>
                                        </div>
                                        <motion.div 
                                          className={`rounded-md border p-2.5 text-[11px] leading-relaxed transition-colors duration-500 ${isCurrent ? 'border-black/10 bg-gray-50 text-black/90 shadow-sm' : 'border-transparent bg-transparent text-black/50'}`}
                                          initial={isCurrent ? { backgroundColor: 'rgba(0,0,0,0.02)' } : {}}
                                          animate={isCurrent ? { backgroundColor: 'rgba(0,0,0,0.05)' } : { backgroundColor: 'transparent' }}
                                          transition={{ duration: 1, repeat: isCurrent ? Infinity : 0, repeatType: 'reverse' }}
                                        >
                                          <TypewriterText text={step.content} active={isCurrent} />
                                        </motion.div>
                                      </motion.div>
                                    );
                                  })}
                                </AnimatePresence>
                              </div>
                            </div>
                            
                            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                          </div>
                          
                          {/* Status List */}
                          <div className="flex flex-col justify-center">
                            <ul className="flex flex-col gap-1 relative">
                              <div className="absolute left-3 top-4 bottom-4 w-px bg-black/10 -z-10" />
                              
                              {activeData.steps.map((step, index) => {
                                const isCompleted = index < currentStepIndex;
                                const isCurrent = index === currentStepIndex || (currentStepIndex >= activeData.steps.length && index === activeData.steps.length - 1);
                                const isUpcoming = index > currentStepIndex;

                                return (
                                  <motion.li 
                                    key={step.id}
                                    layout
                                    className={`flex items-start gap-4 py-2 ${isUpcoming ? 'opacity-40' : 'opacity-100'}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ 
                                      opacity: isUpcoming ? 0.4 : 1, 
                                      x: 0,
                                    }}
                                    transition={{ duration: 0.4 }}
                                  >
                                    <div className="mt-0.5 flex shrink-0 items-center justify-center bg-gray-50/50 rounded-full py-1">
                                      {isCompleted && index < currentStepIndex - 1 || currentStepIndex >= activeData.steps.length ? (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-sm">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                        </span>
                                      ) : isCompleted && index === currentStepIndex - 1 ? (
                                         <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-sm">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                        </span>
                                      ) : isCurrent ? (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white shadow-sm">
                                          <RotateCw className="w-3 h-3 animate-spin text-black" />
                                        </span>
                                      ) : (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black/10 bg-white text-[10px] font-bold text-black/40">
                                          {index + 1}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-col overflow-hidden pt-1">
                                      <span className={`font-sans text-sm font-medium transition-colors duration-300 ${isCurrent ? 'text-black' : isCompleted ? 'text-black/80' : 'text-black/50'}`}>
                                        {step.name}
                                      </span>
                                      <AnimatePresence>
                                        {(isCurrent || (isCompleted && index === currentStepIndex - 1)) && currentStepIndex < activeData.steps.length && (
                                          <motion.span 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="font-sans text-xs text-black/50 mt-1"
                                          >
                                            {step.desc}
                                          </motion.span>
                                        )}
                                        {currentStepIndex >= activeData.steps.length && index === activeData.steps.length - 1 && (
                                           <motion.span 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="font-sans text-xs text-green-600/80 font-medium mt-1"
                                          >
                                            {step.desc}
                                          </motion.span>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </motion.li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                </div>
              </div>
            </div>
            
          </div>
        </section>
        
        <SecurityPhilosophy />
      </div>
    </div>
  );
}
