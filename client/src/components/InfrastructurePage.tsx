import { Smartphone, FileSearch, EyeOff, BarChart3, Scale, BrainCircuit, LockKeyhole, Cpu, Server, Briefcase, Fingerprint, Eye, ShieldAlert, CheckCircle2, X, TrendingDown, Clock, Info, MapPin } from 'lucide-react';
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const TOOLTIP_DICTIONARY: Record<string, string> = {
  "ARM TrustZone": "A hardware security extension that creates an isolated, secure world for sensitive operations, away from the main OS.",
  "SHA-256": "A cryptographic hash function that produces a unique, fixed-size signature for a file. Even a 1-pixel change alters the entire hash.",
  "GAN-fingerprint": "Microscopic noise patterns left behind by Generative Adversarial Networks (AI models) when they create fake images.",
  "zk-SNARKs": "Zero-Knowledge Succinct Non-Interactive Argument of Knowledge. A math proof showing you know something without revealing the thing itself.",
  "smart contract": "Self-executing code on a blockchain that only runs when predetermined conditions (like a judge's digital signature) are met.",
  "Microsoft SEAL": "An open-source homomorphic encryption library developed by Microsoft Research.",
  "OpenFHE": "An open-source Fully Homomorphic Encryption library that allows computing on encrypted data.",
  "BFT": "Byzantine Fault Tolerance. A system's ability to continue operating correctly even if some of its nodes fail or act maliciously.",
  "Transformer": "The neural network architecture behind modern AI, excellent at understanding context in long legal documents."
};

function TechTooltip({ term, description, accent }: { key?: string | number, term: string, description: string, accent?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <span 
      className="relative inline-block cursor-help font-bold underline decoration-dotted underline-offset-4 mx-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={accent}>{term}</span>
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-black text-white rounded-2xl shadow-2xl z-50 text-sm font-normal text-left pointer-events-none normal-case tracking-normal leading-relaxed border border-white/10"
          >
            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-1.5 rounded-lg shrink-0">
                <Info className="w-4 h-4 opacity-90" />
              </div>
              <p className="leading-snug">{description}</p>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black border-t-[8px]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function TextWithTooltips({ text, accentClass }: { text: string, accentClass?: string }) {
  let parts: ReactNode[] = [text];
  
  Object.keys(TOOLTIP_DICTIONARY).forEach(term => {
    const newParts: ReactNode[] = [];
    parts.forEach(part => {
      if (typeof part === 'string') {
        const regex = new RegExp(`(${term})`, 'gi');
        const split = part.split(regex);
        split.forEach((s) => {
          if (s.toLowerCase() === term.toLowerCase()) {
             newParts.push(
               <TechTooltip key={s + Math.random()} term={s} description={TOOLTIP_DICTIONARY[term]} accent={accentClass} />
             );
          } else {
             newParts.push(s);
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });

  return <>{parts}</>;
}

const LAYERS_DATA = [
  {
    id: "layer-1",
    num: "01",
    title: "PRAMANA",
    subtitle: "Secure Evidence Collection Hardware",
    icon: Smartphone,
    problemTitle: "The Tampering Challenge",
    problemDesc: "Digital evidence like photos and videos are easily manipulated on standard devices before ever reaching a court. A compromised operating system can spoof metadata, GPS, and timestamps, leading to endless legal disputes over authenticity.",
    techTitle: "The Hardware Solution",
    techDesc: "PRAMANA shifts trust from software to hardware. Using a secure enclave (like ARM TrustZone), it locks the raw file, hashes it (SHA-256), and binds it to GPS, network time, and biometric data in a hardware-isolated environment. This 'birth certificate' is instantly anchored to the blockchain, making subsequent tampering mathematically impossible.",
    commercialTitle: "Commercial & Real-World Use",
    commercialDesc: "Sold to State Police and Forensic Labs as a hardware-plus-subscription model. Pilot deployments in cyber-crime cells yield immediate ROI by drastically reducing evidence-tampering appeals in district courts. It's an easily procured upgrade similar to police body cameras.",
    target: "State Police, CBI, FSLs",
    roi: "80% Drop in Evidence Appeals",
    benefits: [
      "Hardware-level OS isolation",
      "Immutable SHA-256 hashing",
      "Biometric officer authentication"
    ],
    bg: "bg-white",
    textColor: "text-black",
    iconBg: "bg-black/5 text-black",
    cardBg: "bg-[#F5F5F5] border-black/5",
    accent: "text-black"
  },
  {
    id: "layer-2",
    num: "02",
    title: "MAYA-BREAK",
    subtitle: "Deepfake & Forgery Detection Engine",
    icon: FileSearch,
    problemTitle: "The AI Fraud Epidemic",
    problemDesc: "With generative AI, deepfakes and digitally forged documents are becoming indistinguishable from reality to the human eye. Courts and institutions are struggling to verify the authenticity of submitted digital records.",
    techTitle: "Multi-Layered Detection",
    techDesc: "A robust pipeline checking EXIF metadata for inconsistencies, followed by AI-driven analysis of GAN-fingerprint noise (subtle statistical patterns left by AI models). For scanned documents, it analyzes ink density, kerning, and paper grain to catch digital splicing.",
    commercialTitle: "B2B API-as-a-Service",
    commercialDesc: "Beyond law enforcement, this is offered as an API for banks verifying loan documents, insurance companies checking claims, and property registrars. Charging per verification call creates a massive, scalable revenue stream.",
    target: "Banks, Insurance, Registrars",
    roi: "$20B+ Fraud Prevention Market",
    benefits: [
      "GAN noise pattern recognition",
      "Ink density & kerning analysis",
      "Scalable API infrastructure"
    ],
    bg: "bg-[#2B2644]",
    textColor: "text-white",
    iconBg: "bg-white/10 text-white",
    cardBg: "bg-white/5 border-white/10",
    accent: "text-white"
  },
  {
    id: "layer-3",
    num: "03",
    title: "Zero-Knowledge",
    subtitle: "Total Witness Protection",
    icon: EyeOff,
    problemTitle: "Hostile Witnesses",
    problemDesc: "Witnesses backing out due to fear, threats, or intimidation is one of the most cited reasons for case collapse in India. Traditional witness protection programs are hard to enforce and rely on vulnerable human processes.",
    techTitle: "Cryptographic Anonymity (zk-SNARKs)",
    techDesc: "Witnesses generate a cryptographic proof of a fact (like their location or identity match) without revealing private data. Their real identity is encrypted and stored, unlockable only by a smart contract requiring a judge's digital signature.",
    commercialTitle: "Public Good & Policy Moat",
    commercialDesc: "Adopted as part of a state or national witness protection scheme, funded by government home departments. While less directly monetized, it serves as the ultimate 'public good' feature that makes the entire platform politically indispensable.",
    target: "Ministry of Home Affairs",
    roi: "100% Identity Protection Guarantee",
    benefits: [
      "zk-SNARKs mathematical proofs",
      "Smart-contract access locks",
      "Eliminates witness intimidation"
    ],
    bg: "bg-[#F5F5F5]",
    textColor: "text-black",
    iconBg: "bg-black/5 text-black",
    cardBg: "bg-white border-black/5",
    accent: "text-black"
  },
  {
    id: "layer-4",
    num: "04",
    title: "Secure Analytics",
    subtitle: "Finding Corruption Without Breaking Privacy",
    icon: BarChart3,
    problemTitle: "The Privacy Paradox",
    problemDesc: "Judicial oversight is necessary to clear backlogs and identify anomalies, but judges rightly resist invasive monitoring systems due to valid concerns over judicial independence and data privacy.",
    techTitle: "Homomorphic Encryption",
    techDesc: "Courts encrypt metadata (duration, judge ID). Our engine runs statistical models directly on the encrypted numbers using Microsoft SEAL or OpenFHE. The encrypted result (e.g., 'average case duration') is accurate without the engine ever seeing the raw data.",
    commercialTitle: "Institutional Oversight",
    commercialDesc: "Marketed to national judicial oversight bodies or NGOs, funded via government grants or CSR. It allows systemic anomaly detection—like flagging unusually slow courts—while mathematically guaranteeing absolute privacy for individual case details.",
    target: "Supreme Court, Judicial NGOs",
    roi: "Unlocks $50M in CSR Grants",
    benefits: [
      "Computations on ciphertexts",
      "Absolute judicial privacy",
      "Systemic anomaly detection"
    ],
    bg: "bg-[#2B2644]",
    textColor: "text-white",
    iconBg: "bg-white/10 text-white",
    cardBg: "bg-white/5 border-white/10",
    accent: "text-white"
  },
  {
    id: "layer-5",
    num: "05",
    title: "DHARMA Consensus",
    subtitle: "Justice-Focused Verification Network",
    icon: Scale,
    problemTitle: "Single Points of Failure",
    problemDesc: "Traditional centralized databases are vulnerable to a single corrupt administrator or hacker altering case records, verdicts, or evidence without detection.",
    techTitle: "Byzantine Fault Tolerant Network",
    techDesc: "A custom consensus mechanism where validating nodes are run by court registries, state bar councils, and citizen oversight panels. Altering a sensitive record requires a high quorum across all diverse nodes, making unilateral tampering impossible.",
    commercialTitle: "Infrastructure-as-a-Service",
    commercialDesc: "Provided as the underlying infrastructure for state e-Courts projects under an annual licensing and maintenance fee. It replaces outdated, vulnerable databases with a specialized, highly resilient digital ledger.",
    target: "State e-Courts IT Departments",
    roi: "Annual Recurring Licensing Revenue",
    benefits: [
      "No single point of failure",
      "Multi-stakeholder node validation",
      "Tamper-proof historical ledger"
    ],
    bg: "bg-white",
    textColor: "text-black",
    iconBg: "bg-black/5 text-black",
    cardBg: "bg-[#F5F5F5] border-black/5",
    accent: "text-black"
  },
  {
    id: "layer-6",
    num: "06",
    title: "The Precedent Twin",
    subtitle: "Smart Judgment Check",
    icon: BrainCircuit,
    problemTitle: "Inconsistent Rulings",
    problemDesc: "With millions of cases, ensuring consistency across varied district courts is difficult. Outlier judgments based on identical facts often lead to unnecessary and lengthy appeals.",
    techTitle: "Transformer-Based Anomaly Detection",
    techDesc: "An ML model trained on structured historical judgment data outputs a probability distribution for likely outcomes. If a new ruling falls far outside this distribution, it is flagged as an anomaly for higher review—similar to financial fraud detection.",
    commercialTitle: "Dual-Market Opportunity",
    commercialDesc: "Sold B2G to judicial academies for training and oversight, and B2B as a predictive SaaS tool for law firms to evaluate case strength and litigation strategy based on historical precedent.",
    target: "Law Firms, Judicial Academies",
    roi: "Predictive SaaS Market ($1B+)",
    benefits: [
      "Transformer-based context ML",
      "Statistical outlier flagging",
      "B2B litigation strategy tool"
    ],
    bg: "bg-[#F5F5F5]",
    textColor: "text-black",
    iconBg: "bg-black/5 text-black",
    cardBg: "bg-white border-black/5",
    accent: "text-black"
  }
];

// --- Interactive Widgets --- //

function Layer1Demo() {
  const [step, setStep] = useState(0);
  const [hash, setHash] = useState("0x...");

  useEffect(() => {
    if (step === 2) {
      let i = 0;
      const interval = setInterval(() => {
        setHash("0x" + Math.random().toString(16).substring(2, 14));
        i++;
        if (i > 10) {
          clearInterval(interval);
          setHash("0x8f9a2c33b110");
        }
      }, 50);
      return () => clearInterval(interval);
    } else if (step === 0) {
      setHash("0x...");
    }
  }, [step]);

  const startSequence = () => {
    if (step !== 0) return;
    setStep(1); // Read Raw
    setTimeout(() => setStep(2), 1000); // Hardware Enclave Hash
    setTimeout(() => setStep(3), 2200); // Anchor
    setTimeout(() => setStep(4), 3200); // Success
    setTimeout(() => setStep(0), 5500); // Reset
  };

  return (
    <div className="bg-white border border-black/10 rounded-3xl p-8 md:p-10 min-h-[360px] flex flex-col justify-center relative overflow-hidden shadow-sm group">
      <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50">
        <Cpu className="w-5 h-5" />
        <span className="text-xs font-bold tracking-widest uppercase">PRAMANA Runtime</span>
      </div>

      <div className="max-w-md mx-auto w-full mt-8 relative z-10">
        <div className="flex flex-col gap-4">
          <button 
            onClick={startSequence}
            disabled={step !== 0}
            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all border ${
              step === 0 ? 'bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5' : 'bg-black/5 text-black/30 border-black/5'
            }`}
          >
            {step === 0 ? "Capture Evidence" : "Processing inside Enclave..."}
          </button>

          <div className="space-y-3 mt-4">
            <div className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${step >= 1 ? 'opacity-100 bg-white border-black/10 shadow-sm' : 'opacity-40 border-transparent bg-black/5'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step >= 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-black/10'}`}>1</div>
              <span className="font-medium text-sm flex-1">Isolating Hardware Data</span>
              {step === 1 && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}><Cpu className="w-5 h-5 text-blue-600" /></motion.div>}
              {step > 1 && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${step >= 2 ? 'opacity-100 bg-white border-black/10 shadow-sm' : 'opacity-40 border-transparent bg-black/5'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step >= 2 ? 'bg-blue-600 text-white shadow-md' : 'bg-black/10'}`}>2</div>
              <div className="flex-1">
                <span className="font-medium text-sm block">TrustZone SHA-256 Hash</span>
                {step >= 2 && <span className="text-xs font-mono text-black/50 block mt-1 bg-black/5 px-2 py-1 rounded inline-block">{hash}</span>}
              </div>
              {step === 2 && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}><LockKeyhole className="w-5 h-5 text-blue-600" /></motion.div>}
              {step > 2 && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${step >= 3 ? 'opacity-100 bg-green-50 border-green-200 shadow-sm' : 'opacity-40 border-transparent bg-black/5'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step >= 3 ? 'bg-green-600 text-white shadow-md' : 'bg-black/10'}`}>3</div>
              <div className="flex-1">
                <span className="font-medium text-sm block text-green-900">Blockchain Anchored</span>
                {step >= 3 && <span className="text-xs font-bold text-green-700 block mt-1">Immutable Record Created</span>}
              </div>
              {step === 3 && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><Server className="w-5 h-5 text-green-600" /></motion.div>}
              {step > 3 && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layer2Demo() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<'clean' | 'fake' | null>(null);

  const handleScan = (type: 'clean' | 'fake') => {
    if (scanning) return;
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult(type);
    }, 2000);
  };

  return (
    <div className="bg-[#1A1525] backdrop-blur-sm rounded-3xl p-8 md:p-10 min-h-[360px] flex flex-col justify-center items-center text-center shadow-inner border border-white/10 relative overflow-hidden group">
      
      <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50 text-white z-20">
        <FileSearch className="w-5 h-5" />
        <span className="text-xs font-bold tracking-widest uppercase">MAYA-BREAK Engine</span>
      </div>

      {/* Abstract background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50 z-0"></div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl mt-8 relative z-10">
        <div className="flex-1 flex flex-col justify-center gap-4">
          <button 
            onClick={() => handleScan('clean')}
            disabled={scanning}
            className="w-full py-4 bg-white/5 text-white font-bold tracking-wide rounded-xl hover:bg-white/10 disabled:opacity-50 transition-colors border border-white/10 shadow-lg relative overflow-hidden"
          >
            Scan Authentic Doc
          </button>
          <button 
            onClick={() => handleScan('fake')}
            disabled={scanning}
            className="w-full py-4 bg-white/5 text-white font-bold tracking-wide rounded-xl hover:bg-red-500/10 disabled:opacity-50 transition-colors border border-white/10 shadow-lg hover:border-red-500/30 group/btn"
          >
            <span className="group-hover/btn:text-red-400 transition-colors">Scan Forged Doc</span>
          </button>
        </div>

        <div className="flex-1 bg-black/60 rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-md flex flex-col">
           {scanning && (
             <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(59,130,246,0.3)_50%,transparent_100%)] w-full h-full animate-[scan_2s_linear_infinite] z-20 pointer-events-none" style={{ backgroundSize: '100% 200%' }}></div>
           )}
           
           <div className="flex-1 flex items-center justify-center relative min-h-[120px]">
             {/* Document Representation */}
             <div className={`w-32 h-40 bg-white rounded-lg shadow-lg relative overflow-hidden transition-all duration-500 ${scanning ? 'opacity-80 scale-95' : 'opacity-100 scale-100'} ${result === 'fake' ? 'border-2 border-red-500' : 'border border-black/10'}`}>
                <div className="w-full h-8 bg-gray-100 border-b border-black/5"></div>
                <div className="p-3 space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
                {result === 'fake' && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="absolute bottom-4 right-4 w-10 h-10 border-2 border-red-500 bg-red-500/20 rounded">
                     <span className="absolute -top-6 -right-2 text-[8px] bg-red-500 text-white px-1 py-0.5 rounded uppercase font-bold tracking-wider">Spliced</span>
                  </motion.div>
                )}
             </div>
           </div>

           <div className="mt-6 h-[80px] flex flex-col justify-end">
             {!scanning && !result && (
               <div className="text-white/40 text-sm font-medium text-center">Select a document to scan</div>
             )}
             {scanning && (
               <div className="space-y-2 text-left">
                 <div className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded inline-block">Analyzing EXIF & Noise...</div>
                 <div className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded inline-block animate-pulse delay-75">Verifying Ink Density...</div>
               </div>
             )}
             {result === 'clean' && (
               <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-center bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                 <span className="text-green-400 font-bold tracking-wide flex items-center justify-center gap-2 mb-1">
                   <CheckCircle2 className="w-4 h-4" /> 100% Authentic
                 </span>
                 <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">No tampering detected</span>
               </motion.div>
             )}
             {result === 'fake' && (
               <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-center bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                 <span className="text-red-400 font-bold tracking-wide flex items-center justify-center gap-2 mb-1">
                   <ShieldAlert className="w-4 h-4" /> Forgery Detected
                 </span>
                 <span className="text-[10px] text-red-300/70 font-mono uppercase tracking-widest">GAN artifact signature #A92-F</span>
               </motion.div>
             )}
           </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { background-position: 0 -100%; }
          100% { background-position: 0 200%; }
        }
      `}</style>
    </div>
  );
}

function Layer3Demo() {
  const [isPublic, setIsPublic] = useState(true);
  return (
    <div className="bg-white border border-black/10 rounded-3xl p-8 md:p-10 min-h-[360px] flex flex-col justify-center relative shadow-sm overflow-hidden group">
      <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50 z-20">
        <EyeOff className="w-5 h-5" />
        <span className="text-xs font-bold tracking-widest uppercase">Zero-Knowledge Module</span>
      </div>
      
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 z-0"></div>

      <div className="flex justify-center gap-4 mb-8 mt-8 relative z-10">
        <button 
          onClick={() => setIsPublic(true)} 
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${isPublic ? 'bg-black text-white shadow-lg border-black scale-105' : 'bg-white text-black/50 border-black/10 hover:bg-black/5 hover:text-black/80'}`}
        >
          Public Record View
        </button>
        <button 
          onClick={() => setIsPublic(false)} 
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${!isPublic ? 'bg-blue-600 text-white shadow-lg border-blue-600 scale-105' : 'bg-white text-black/50 border-black/10 hover:bg-black/5 hover:text-black/80'}`}
        >
          Sealed Judge View
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          {isPublic ? (
            <motion.div key="public" initial={{opacity:0, x: -20}} animate={{opacity:1, x: 0}} exit={{opacity: 0, x: 20}} className="bg-[#F5F5F5] rounded-2xl p-6 border border-black/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/10 relative z-10">
                <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center shadow-inner">
                  <LockKeyhole className="w-8 h-8 text-black/40" />
                </div>
                <div>
                  <p className="text-xs text-black/40 uppercase tracking-widest font-bold mb-1">Witness Identity</p>
                  <p className="font-mono text-2xl font-medium tracking-widest text-black/80 bg-black/10 px-2 py-1 rounded inline-block blur-[2px] select-none">RAHUL KUMAR</p>
                </div>
              </div>
              <div className="relative z-10">
                 <p className="text-xs text-black/40 uppercase tracking-widest font-bold mb-2">Cryptographic Proof (zk-SNARK)</p>
                 <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center gap-3">
                   <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                   <p className="text-sm font-mono text-green-700 break-all leading-relaxed">
                     Verified_Proof_0x994f2b38c290a1b2c3d4e5f600112233
                   </p>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="private" initial={{opacity:0, x: 20}} animate={{opacity:1, x: 0}} exit={{opacity: 0, x: -20}} className="bg-blue-50/80 rounded-2xl p-6 border border-blue-200 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-blue-200/50 relative z-10">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Fingerprint className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs text-blue-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Decrypted via Court Order #8821</p>
                  <p className="text-2xl font-medium text-blue-900 tracking-wide">Rahul Kumar</p>
                </div>
              </div>
              <div className="relative z-10">
                 <p className="text-xs text-blue-500 uppercase tracking-widest font-bold mb-2">Verified Attributes</p>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center hover:border-blue-300 transition-colors">
                     <p className="text-[10px] uppercase text-blue-400 font-bold mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</p>
                     <p className="text-sm font-bold text-blue-900">Marine Drive, Mumbai</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center hover:border-blue-300 transition-colors">
                     <p className="text-[10px] uppercase text-blue-400 font-bold mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Timestamp</p>
                     <p className="text-sm font-bold text-blue-900">22:45 IST (Verified)</p>
                   </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Layer4Demo() {
  const [isEncrypted, setIsEncrypted] = useState(true);
  
  const data = [
    { name: 'Jan', value: 40, enc: '0x2a' },
    { name: 'Feb', value: 30, enc: '0x1e' },
    { name: 'Mar', value: 60, enc: '0x3c' },
    { name: 'Apr', value: 45, enc: '0x2d' },
    { name: 'May', value: 80, enc: '0x50' },
  ];

  return (
    <div className="bg-[#1A1525] backdrop-blur-sm rounded-3xl p-8 md:p-10 min-h-[360px] flex flex-col justify-center shadow-inner border border-white/10 relative group">
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-30 z-0"></div>

      <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50 text-white z-20">
        <BarChart3 className="w-5 h-5" />
        <span className="text-xs font-bold tracking-widest uppercase">Secure Analytics</span>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => setIsEncrypted(!isEncrypted)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border shadow-lg ${isEncrypted ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700 hover:-translate-y-0.5'}`}
        >
          {isEncrypted ? <><LockKeyhole className="w-4 h-4" /> Toggle Decrypt</> : <><Eye className="w-4 h-4" /> Toggle Encrypt</>}
        </button>
      </div>
      
      <div className="mt-12 flex-1 w-full max-w-3xl mx-auto flex flex-col justify-between relative z-10">
        <div className="h-48 w-full mb-8 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isEncrypted ? "#4b5563" : "#3b82f6"} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={isEncrypted ? "#4b5563" : "#3b82f6"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isEncrypted ? "#6b7280" : "#60a5fa"} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                style={{ filter: isEncrypted ? 'blur(12px)' : 'none', transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Overlay text for encrypted state */}
          <AnimatePresence>
            {isEncrypted && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                 <div className="bg-black/80 backdrop-blur-md border border-white/10 px-8 py-4 rounded-2xl text-center shadow-2xl">
                   <p className="text-white font-mono text-sm tracking-widest mb-1">DATA OBFUSCATED</p>
                   <p className="text-white/50 text-xs">Computing on ciphertexts</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-5 gap-3 text-center mb-6">
          {data.map((d, i) => (
            <div key={i} className={`p-2 rounded-xl transition-all duration-500 border ${isEncrypted ? 'bg-white/5 border-white/10' : 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'}`}>
              <p className="text-[10px] text-white/40 uppercase mb-1 font-bold">{d.name}</p>
              <p className={`font-mono text-sm transition-colors duration-500 ${isEncrypted ? 'text-white/30 blur-[1px]' : 'text-blue-400'}`}>
                {isEncrypted ? d.enc : d.value}
              </p>
            </div>
          ))}
        </div>

        <div className={`text-center font-mono text-sm p-5 rounded-2xl transition-all duration-500 border shadow-lg ${isEncrypted ? 'bg-white/5 text-white/40 border-white/10' : 'bg-blue-600/20 text-blue-300 border-blue-500/40'}`}>
          <div className="text-[10px] uppercase font-bold tracking-widest mb-1.5 opacity-70">Homomorphic Computation Result: Average</div>
          <div className="text-lg">{isEncrypted ? '0x8f9a2c33b110e4d5...' : '51.0 Cases / Month'}</div>
        </div>
      </div>
    </div>
  );
}

function Layer5Demo() {
  const [votes, setVotes] = useState({ registry: false, bar: false, citizens: false });
  const allApproved = votes.registry && votes.bar && votes.citizens;

  const toggleVote = (key: keyof typeof votes) => {
    setVotes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white border border-black/10 rounded-3xl p-8 md:p-10 min-h-[360px] flex flex-col justify-center items-center shadow-sm relative overflow-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50 z-20">
        <Scale className="w-5 h-5" />
        <span className="text-xs font-bold tracking-widest uppercase">BFT Consensus</span>
      </div>

      <div className="w-full max-w-2xl mt-8 relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-black/40 uppercase tracking-widest mb-3">Pending State Change</p>
          <div className="inline-block bg-blue-50 text-blue-800 border border-blue-200 px-5 py-3 rounded-xl font-mono text-sm shadow-inner">
            UPDATE verdict_status = 'FINAL' WHERE case_id = #9921
          </div>
        </div>

        {/* SVG Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[-1]" style={{ top: '120px' }}>
           <path d="M 16.5% 40 L 50% 150" stroke={votes.registry ? '#22c55e' : '#e5e7eb'} strokeWidth="2" fill="none" strokeDasharray={votes.registry ? 'none' : '4 4'} className="transition-all duration-500" />
           <path d="M 50% 40 L 50% 150" stroke={votes.bar ? '#22c55e' : '#e5e7eb'} strokeWidth="2" fill="none" strokeDasharray={votes.bar ? 'none' : '4 4'} className="transition-all duration-500" />
           <path d="M 83.5% 40 L 50% 150" stroke={votes.citizens ? '#22c55e' : '#e5e7eb'} strokeWidth="2" fill="none" strokeDasharray={votes.citizens ? 'none' : '4 4'} className="transition-all duration-500" />
        </svg>

        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-16">
          <button 
            onClick={() => toggleVote('registry')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border-2 ${votes.registry ? 'bg-green-50 border-green-500 shadow-md scale-105' : 'bg-white border-black/10 hover:border-black/20 hover:bg-gray-50'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${votes.registry ? 'bg-green-500 text-white' : 'bg-black/5 text-black/40'}`}>
               <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-center">Court<br/>Registry</span>
          </button>

          <button 
            onClick={() => toggleVote('bar')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border-2 ${votes.bar ? 'bg-green-50 border-green-500 shadow-md scale-105' : 'bg-white border-black/10 hover:border-black/20 hover:bg-gray-50'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${votes.bar ? 'bg-green-500 text-white' : 'bg-black/5 text-black/40'}`}>
               <Scale className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-center">State Bar<br/>Council</span>
          </button>

          <button 
            onClick={() => toggleVote('citizens')}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border-2 ${votes.citizens ? 'bg-green-50 border-green-500 shadow-md scale-105' : 'bg-white border-black/10 hover:border-black/20 hover:bg-gray-50'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${votes.citizens ? 'bg-green-500 text-white' : 'bg-black/5 text-black/40'}`}>
               <Eye className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-center">Citizen<br/>Panel</span>
          </button>
        </div>

        <div className="text-center relative z-10">
          <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold tracking-widest uppercase transition-all duration-500 border-2 ${
            allApproved ? 'bg-green-500 text-white border-green-600 shadow-xl scale-110' : 'bg-black/5 text-black/40 border-transparent'
          }`}>
            {allApproved ? (
              <><CheckCircle2 className="w-6 h-6" /> Consensus Reached</>
            ) : (
              <><LockKeyhole className="w-6 h-6 opacity-50" /> Awaiting Quorum</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Layer6Demo() {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);

  const cases = [
    { id: 1, type: "Property Dispute", match: 94, isAnomaly: false, text: "Standard partition of ancestral land, follows 1956 Succession Act guidelines." },
    { id: 2, type: "Criminal Appeal", match: 12, isAnomaly: true, text: "Bail granted despite 3 prior convictions under similar non-bailable sections. Deviates from 98% of precedent." }
  ];

  return (
    <div className="bg-white border border-black/10 rounded-3xl p-8 md:p-10 min-h-[360px] flex flex-col justify-center relative shadow-sm overflow-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50">
        <BrainCircuit className="w-5 h-5" />
        <span className="text-xs font-bold tracking-widest uppercase">Precedent Twin</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl mx-auto mt-8">
        {/* Left Side: Case Feed */}
        <div className="flex-1 space-y-4">
          <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Live Judgment Feed</p>
          {cases.map((c) => (
            <div 
              key={c.id}
              onClick={() => setSelectedCase(c.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedCase === c.id ? 'border-blue-500 bg-blue-50 shadow-sm scale-[1.02]' : 'border-black/10 bg-white hover:border-black/30'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm">Case #{202400 + c.id}</span>
                <span className="text-[10px] uppercase font-bold text-black/40 bg-black/5 px-2 py-1 rounded">{c.type}</span>
              </div>
              <p className="text-sm text-black/60 line-clamp-2">{c.text}</p>
            </div>
          ))}
        </div>

        {/* Right Side: AI Analysis */}
        <div className="flex-1 bg-[#1A1525] rounded-2xl p-6 border border-black/5 flex flex-col relative overflow-hidden shadow-inner">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 relative z-10">Transformer Analysis</p>
          
          {/* Abstract node background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]"></div>

          {!selectedCase ? (
            <div className="flex-1 flex items-center justify-center text-sm font-medium text-white/30 text-center relative z-10">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <BrainCircuit className="w-8 h-8 opacity-50" />
                <span>Select a judgment from the feed<br/>to run precedent analysis</span>
              </div>
            </div>
          ) : (
            <motion.div initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale: 1}} key={selectedCase} className="flex-1 flex flex-col justify-center relative z-10">
              {cases.find(c => c.id === selectedCase)?.isAnomaly ? (
                <div className="text-center space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-full h-full bg-red-500/20 text-red-400 rounded-full flex items-center justify-center border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-red-400 tracking-wide uppercase">Anomaly Detected</h3>
                  
                  {/* Distribution graph mock */}
                  <div className="h-12 w-full max-w-[200px] mx-auto relative flex items-end justify-center gap-1 opacity-70">
                    <div className="w-2 h-4 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-8 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-10 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-12 bg-white/40 rounded-t"></div>
                    <div className="w-2 h-10 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-8 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-4 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-t absolute -right-2"></div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-sm text-red-200 backdrop-blur-sm">
                    <span className="block font-bold mb-1 text-red-400">Confidence Score: {cases.find(c => c.id === selectedCase)?.match}%</span>
                    This ruling falls strictly outside the statistical distribution for similar fact patterns. Flagged for review.
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-green-400 tracking-wide uppercase">Standard Precedent</h3>
                  
                  {/* Distribution graph mock */}
                  <div className="h-12 w-full max-w-[200px] mx-auto relative flex items-end justify-center gap-1 opacity-70">
                    <div className="w-2 h-4 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-8 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-10 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-12 bg-green-500 rounded-t"></div>
                    <div className="w-2 h-10 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-8 bg-white/20 rounded-t"></div>
                    <div className="w-2 h-4 bg-white/20 rounded-t"></div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl text-sm text-green-200 backdrop-blur-sm">
                    <span className="block font-bold mb-1 text-green-400">Confidence Score: {cases.find(c => c.id === selectedCase)?.match}%</span>
                    This ruling strongly aligns with historical precedent (94% match) for similar property dispute fact patterns.
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommercialModal({ isOpen, onClose, layer }: { isOpen: boolean, onClose: () => void, layer: any }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden my-8"
        >
          <div className="p-8 md:p-10 border-b border-black/5 bg-gray-50/50">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors">
              <X className="w-6 h-6 text-black/40" />
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase mb-4">
              <TrendingDown className="w-4 h-4" />
              <span>Economic Impact Assessment</span>
            </div>
            <h2 className="text-3xl font-medium tracking-tight mb-2 text-black">
              Cost Savings & Implementation Roadmap
            </h2>
            <p className="text-black/60 text-lg">
              Projected metrics for Indian State Judicial Departments adopting {layer?.title || 'the platform'}.
            </p>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            {/* Cost Savings Breakdown */}
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-600" />
                State-Level Financial Projections (3-Year Horizon)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <p className="text-green-800 text-sm font-bold uppercase tracking-widest mb-2">Operational Savings</p>
                  <p className="text-3xl font-medium text-green-700 mb-1">₹45 Cr</p>
                  <p className="text-xs text-green-600/80">Reduction in manual verification & delays</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <p className="text-blue-800 text-sm font-bold uppercase tracking-widest mb-2">Time Recovered</p>
                  <p className="text-3xl font-medium text-blue-700 mb-1">2.4M</p>
                  <p className="text-xs text-blue-600/80">Man-hours saved across courts & labs</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <p className="text-purple-800 text-sm font-bold uppercase tracking-widest mb-2">Appeal Reduction</p>
                  <p className="text-3xl font-medium text-purple-700 mb-1">60%</p>
                  <p className="text-xs text-purple-600/80">Drop in appeals on evidence tampering</p>
                </div>
              </div>
            </div>

            {/* Implementation Roadmap */}
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Pilot Implementation Roadmap
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4 relative">
                  <div className="w-px bg-black/10 absolute top-8 bottom-[-24px] left-5"></div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10 border border-blue-200">
                    <span className="font-bold text-sm">01</span>
                  </div>
                  <div className="pt-2 text-black">
                    <h4 className="font-bold text-lg mb-1">Phase 1: Sandboxed Pilot (Months 1-3)</h4>
                    <p className="text-black/60 text-sm">Deployment in a controlled environment (e.g., specific Cyber Crime Cells in Maharashtra or Telangana). Focus on high-value digital evidence intake using parallel systems.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 relative text-black">
                  <div className="w-px bg-black/10 absolute top-8 bottom-[-24px] left-5"></div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10 border border-blue-200">
                    <span className="font-bold text-sm">02</span>
                  </div>
                  <div className="pt-2 text-black">
                    <h4 className="font-bold text-lg mb-1">Phase 2: Court Registry Integration (Months 4-6)</h4>
                    <p className="text-black/60 text-sm">Integration with existing e-Courts APIs. Training for district court clerks and select judges. Commencing processing of live, low-stakes case data.</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10 border border-blue-200">
                    <span className="font-bold text-sm">03</span>
                  </div>
                  <div className="pt-2 text-black">
                    <h4 className="font-bold text-lg mb-1">Phase 3: Statewide Rollout & Legislation (Months 7-12)</h4>
                    <p className="text-black/60 text-sm">Full deployment across district and high courts. Policy drafting for formal recognition of cryptographic proofs in state-level judicial proceedings.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black text-white p-6 rounded-2xl flex items-center justify-between">
               <div>
                 <p className="font-bold mb-1">Ready to initiate a pilot?</p>
                 <p className="text-white/60 text-sm">Contact our government relations team for a detailed proposal.</p>
               </div>
               <button className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">
                 Request Proposal
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function LayerContent({ layer, index }: { layer: typeof LAYERS_DATA[0], index: number }) {
  const [activeTab, setActiveTab] = useState<'problem' | 'tech' | 'commercial'>('problem');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isReversed = index % 2 !== 0;

  return (
    <div className={`w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center ${layer.textColor}`}>
      <CommercialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} layer={layer} />
      
      {/* DEMO BLOCK */}
      <motion.div 
        initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className={`w-full relative z-10 ${isReversed ? 'lg:order-last' : ''}`}
      >
         <div className={`absolute -top-10 -left-10 text-[240px] font-bold opacity-[0.03] select-none pointer-events-none leading-none z-[-1] ${layer.textColor === 'text-white' ? 'text-white' : 'text-black'}`}>
           {layer.num}
         </div>
         
         <div className="relative shadow-2xl rounded-3xl overflow-hidden border border-black/5">
           {layer.id === 'layer-1' && <Layer1Demo />}
           {layer.id === 'layer-2' && <Layer2Demo />}
           {layer.id === 'layer-3' && <Layer3Demo />}
           {layer.id === 'layer-4' && <Layer4Demo />}
           {layer.id === 'layer-5' && <Layer5Demo />}
           {layer.id === 'layer-6' && <Layer6Demo />}
         </div>
      </motion.div>

      {/* CONTENT BLOCK */}
      <motion.div 
        initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="w-full flex flex-col z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${layer.iconBg}`}>
            <layer.icon className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase opacity-60">Layer {layer.num} • {layer.title}</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-8 leading-tight" style={{ letterSpacing: '-0.02em' }}>
          {layer.subtitle}
        </h2>

        {/* Custom Tabs */}
        <div className="flex gap-4 md:gap-6 mb-8 border-b border-current border-opacity-10 overflow-x-auto hide-scrollbar">
          {[
            { id: 'problem', label: 'The Problem' },
            { id: 'tech', label: 'Tech Solution' },
            { id: 'commercial', label: 'Commercial Strategy' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-current opacity-100' 
                  : 'border-transparent opacity-40 hover:opacity-80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[260px] relative">
          {activeTab === 'problem' && (
            <motion.div key="problem" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className={`w-5 h-5 ${layer.accent}`} />
                <h3 className="text-xl font-medium">{layer.problemTitle}</h3>
              </div>
              <p className="text-lg opacity-80 leading-relaxed">{layer.problemDesc}</p>
            </motion.div>
          )}
          {activeTab === 'tech' && (
            <motion.div key="tech" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0">
              <div className="flex items-center gap-2 mb-4">
                <Server className={`w-5 h-5 ${layer.accent}`} />
                <h3 className="text-xl font-medium">{layer.techTitle}</h3>
              </div>
              <p className="text-lg opacity-80 leading-relaxed mb-6">
                <TextWithTooltips text={layer.techDesc} accentClass={layer.accent} />
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {layer.benefits.map((b: string, i: number) => (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${layer.cardBg}`}>
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 opacity-60" />
                    <span className="text-sm font-medium leading-snug">{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'commercial' && (
            <motion.div key="commercial" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0">
               <div className="flex items-center gap-2 mb-4">
                <Briefcase className={`w-5 h-5 ${layer.accent}`} />
                <h3 className="text-xl font-medium">{layer.commercialTitle}</h3>
              </div>
              <p className="text-lg opacity-80 leading-relaxed mb-8">{layer.commercialDesc}</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={`flex-1 p-5 rounded-2xl ${layer.cardBg}`}>
                   <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-2">Target Market</p>
                   <p className="font-medium text-lg">{layer.target}</p>
                </div>
                <div className={`flex-1 p-5 rounded-2xl ${layer.cardBg}`}>
                   <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-2">Impact / ROI</p>
                   <p className="font-medium text-lg">{layer.roi}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        <div className="mt-8 pt-8 border-t border-current border-opacity-10">
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold tracking-wide transition-colors ${
              layer.textColor === 'text-white' 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
            View Commercial Impact
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { DocumentHeroAnimation } from './DocumentHeroAnimation';

export function InfrastructurePage() {
  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Hero Section */}
      <div className="pt-32 pb-24 px-6 border-b border-black/5 relative overflow-hidden bg-white min-h-[80vh] flex items-center justify-center">
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)] pointer-events-none"></div>
        
        <DocumentHeroAnimation />

        <div className="max-w-5xl mx-auto text-center flex flex-col items-center relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black border border-black/10 text-white text-xs font-bold tracking-widest uppercase mb-8 shadow-xl"
          >
            <Cpu className="w-4 h-4" />
            <span>Pure Software Architecture</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-medium leading-[1.1] mb-8 text-black tracking-tight"
            style={{ letterSpacing: '-0.04em' }}
          >
            The 6 Layers of <br/>Absolute Trust
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-black/60 text-xl md:text-2xl leading-relaxed max-w-3xl font-medium"
          >
            Explore the deep technical engines and practical real-world applications of the Nyayakasha system. Built for scale, security, and zero disruption.
          </motion.p>
        </div>
      </div>

      <div className="w-full flex flex-col relative">
        {LAYERS_DATA.map((layer, index) => (
          <section 
            key={layer.id} 
            id={layer.id}
            className={`${layer.bg} py-24 md:py-32 px-6 border-b ${layer.bg === 'bg-[#2B2644]' ? 'border-white/10' : 'border-black/5'} overflow-hidden relative`}
          >
             <LayerContent layer={layer} index={index} />
          </section>
        ))}

        {/* Bonus Layer */}
        <section 
          id="layer-bonus"
          className="bg-[#0A0A0A] text-white py-24 md:py-40 px-6 relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 mx-auto mb-8 shadow-2xl shadow-white/5 border border-white/20 backdrop-blur-sm">
                 <LockKeyhole className="w-10 h-10" />
              </div>
              <h2 className="text-5xl md:text-7xl font-medium tracking-tight mb-6" style={{ letterSpacing: '-0.03em' }}>
                Post-Quantum Security
              </h2>
              <p className="text-blue-400 text-2xl font-medium uppercase tracking-widest">
                Future-Proof Cryptography
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left w-full max-w-5xl">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-10 md:p-12 shadow-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <Server className="w-8 h-8 text-blue-400" />
                    <h3 className="text-3xl font-medium tracking-tight">How It Works</h3>
                  </div>
                  <p className="text-xl leading-relaxed text-white/70">
                    We utilize advanced lattice-based security architectures (such as CRYSTALS-Dilithium), recognized as the most resilient mathematical frameworks globally. While standard encryption is vulnerable to upcoming quantum computing advancements, our architecture ensures absolute integrity.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-10 md:p-12 shadow-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <Briefcase className="w-8 h-8 text-blue-400" />
                    <h3 className="text-3xl font-medium tracking-tight">Why It Matters</h3>
                  </div>
                  <p className="text-xl leading-relaxed text-white/70">
                    This represents our ultimate commitment to trust. By deploying post-quantum safeguards today, we guarantee that long-term legal artifacts—such as land deeds, convictions, and precedent records—remain cryptographically unbreakable for decades into the future.
                  </p>
                </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

