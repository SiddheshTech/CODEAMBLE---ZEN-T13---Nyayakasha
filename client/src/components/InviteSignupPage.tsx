import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User, Phone, BadgeInfo, CheckCircle2, ShieldCheck, Building2, ArrowRight, Lock, KeyRound, AlertTriangle, Check, UploadCloud, X, Loader2, Info, FileText, Edit2, Fingerprint, Smartphone, QrCode, ChevronDown, ChevronUp, Camera, Link, Users, Inbox } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { api } from '../services/api';

type Step = 'invite' | 'details' | 'password' | 'upload' | 'vetting' | 'review' | 'success' | 'approved' | 'mfa' | 'duress' | 'keys' | 'onboarding';

function calculateBlur(imageData: ImageData) {
  const { width, height, data } = imageData;
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      
      const top = (data[((y-1)*width + x) * 4] + data[((y-1)*width + x) * 4 + 1] + data[((y-1)*width + x) * 4 + 2]) / 3;
      const bottom = (data[((y+1)*width + x) * 4] + data[((y+1)*width + x) * 4 + 1] + data[((y+1)*width + x) * 4 + 2]) / 3;
      const left = (data[(y*width + x - 1) * 4] + data[(y*width + x - 1) * 4 + 1] + data[(y*width + x - 1) * 4 + 2]) / 3;
      const right = (data[(y*width + x + 1) * 4] + data[(y*width + x + 1) * 4 + 1] + data[(y*width + x + 1) * 4 + 2]) / 3;
      
      const laplacian = 4 * gray - top - bottom - left - right;
      
      sum += laplacian;
      sumSq += laplacian * laplacian;
      count++;
    }
  }

  if (count === 0) return 0;
  const mean = sum / count;
  const variance = (sumSq / count) - (mean * mean);
  return variance;
}

export function InviteSignupPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [step, setStep] = useState<Step>('invite');
  
  const [assignedRole, setAssignedRole] = useState<'Independent Validator' | 'Court Authority' | 'Field Submitter'>('Independent Validator');
  const [validatorSubtype, setValidatorSubtype] = useState<'bar_side' | 'citizen_side'>('bar_side');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [officialId, setOfficialId] = useState('');
  const [judicialApptId, setJudicialApptId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBreached, setIsBreached] = useState(false);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<'checking' | 'good' | 'blurry' | 'dark' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [vettingConsent, setVettingConsent] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mfaMethod, setMfaMethod] = useState<'select' | 'totp' | 'enrolling' | 'success'>('select');
  const [showPinInfo, setShowPinInfo] = useState(false);
  const [enableOptInPin, setEnableOptInPin] = useState(false);
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [keyProgress, setKeyProgress] = useState(0);
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Dynamic institution based on role & subtype
  const institution = React.useMemo(() => {
    if (assignedRole === 'Independent Validator') {
      return validatorSubtype === 'bar_side' 
        ? 'Bar Council Oversight Panel' 
        : 'Citizen Judicial Oversight Committee';
    } else if (assignedRole === 'Court Authority') {
      return 'Bombay High Court — Appellate Bench 4';
    } else {
      return 'State Police Department HR & Badge Registry';
    }
  }, [assignedRole, validatorSubtype]);

  // Handle Role Change
  const handleRoleChange = (role: 'Independent Validator' | 'Court Authority' | 'Field Submitter') => {
    setAssignedRole(role);
  };

  const handleSubtypeChange = (subtype: 'bar_side' | 'citizen_side') => {
    setValidatorSubtype(subtype);
  };

  const onboardingCards = React.useMemo(() => {
    if (assignedRole === 'Field Submitter') {
      return [
        { icon: <Camera className="w-10 h-10 text-black" />, title: "Capture Evidence", desc: "Here's how evidence capture works—snap photos or record video securely." },
        { icon: <Link className="w-10 h-10 text-black" />, title: "Chain of Custody", desc: "Every capture is immediately cryptographically hashed and sealed." },
        { icon: <UploadCloud className="w-10 h-10 text-black" />, title: "Secure Upload", desc: "Evidence syncs automatically when you're back online." }
      ];
    } else if (assignedRole === 'Independent Validator') {
       return [
        { icon: <Users className="w-10 h-10 text-black" />, title: "Consensus Voting", desc: "Here's how consensus voting works—review peer submissions and cast independent validation votes across the network." },
        { icon: <ShieldCheck className="w-10 h-10 text-black" />, title: "Encrypted Aggregate Analytics", desc: "Here's how encrypted aggregate analytics work—participate in zero-knowledge threshold decryption for oversight reporting." },
        { icon: <FileText className="w-10 h-10 text-black" />, title: "Audit Log Inspection", desc: "Here's your audit log—inspect immutable ledger entries, verification receipts, and system integrity logs." }
       ];
    } else {
       return [
        { icon: <Inbox className="w-10 h-10 text-black" />, title: "Case Review Queue", desc: "Here's your case review queue—inspect verified evidence dockets with end-to-end cryptographic integrity." },
        { icon: <AlertTriangle className="w-10 h-10 text-black" />, title: "Forgery Flags", desc: "Here's how forgery flags reach you—automated metadata tampering and AI deepfake detection alerts highlight suspect evidence." },
        { icon: <Users className="w-10 h-10 text-black" />, title: "Consensus Approvals", desc: "Here's how consensus approvals work—collaborate with independent validators to grant official court admissibility." }
       ];
    }
  }, [assignedRole]);

  // Real check with HaveIBeenPwned API (k-anonymity)
  React.useEffect(() => {
    if (password.length < 5) {
      setIsBreached(false);
      return;
    }
    
    const checkBreach = async (pwd: string) => {
      setIsCheckingBreach(true);
      try {
        const msgUint8 = new TextEncoder().encode(pwd);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        
        const prefix = hashHex.slice(0, 5);
        const suffix = hashHex.slice(5);
        
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text = await response.text();
        
        const hashes = text.split('\n').map(line => line.split(':')[0].trim());
        if (hashes.includes(suffix)) {
          setIsBreached(true);
        } else {
          setIsBreached(false);
        }
      } catch (error) {
        console.error("Failed to check breached passwords:", error);
      } finally {
        setIsCheckingBreach(false);
      }
    };
    
    const timer = setTimeout(() => {
      checkBreach(password);
    }, 500); // debounce
    
    return () => clearTimeout(timer);
  }, [password]);

  // Validation
  const isNameValid = fullName.trim().length >= 3;
  const isEmailValid = email.trim().length >= 5 && email.includes('@');
  const isIdValid = officialId.trim().length >= 5;
  const isPhoneValid = phone.trim().length >= 10;
  
  const canContinueDetails = isNameValid && isEmailValid && isIdValid && isPhoneValid;

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const rules = [
    { label: "At least 8 characters", valid: hasMinLength },
    { label: "One uppercase letter", valid: hasUppercase },
    { label: "One number", valid: hasNumber },
    { label: "One special symbol", valid: hasSymbol },
  ];

  const satisfiedCount = rules.filter(r => r.valid).length;
  
  let strength = 0;
  if (password.length > 0) {
    if (satisfiedCount <= 1) strength = 1;
    else if (satisfiedCount === 2) strength = 2;
    else if (satisfiedCount === 3) strength = 3;
    else if (satisfiedCount === 4) strength = 4;
  }

  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const strengthColors = ['bg-black/10', 'bg-amber-500', 'bg-amber-400', 'bg-lime-500', 'bg-green-500'];

  const isPasswordValid = satisfiedCount === 4 && !isBreached;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  
  const canContinuePassword = isPasswordValid && doPasswordsMatch;

  const checkImageQuality = (file: File) => {
    setImageQuality('checking');
    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImagePreview(src);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setImageQuality('good');
            return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let brightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        brightness = brightness / (data.length / 4);
        
        if (brightness < 40) {
           setImageQuality('dark');
           return;
        }

        const variance = calculateBlur(imageData);
        if (variance < 100) { 
           setImageQuality('blurry');
           return;
        }
        
        setImageQuality('good');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      checkImageQuality(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      checkImageQuality(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageQuality(null);
  };

  const loadSampleImage = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
      <rect width="600" height="380" rx="20" fill="#0F172A"/>
      <rect x="20" y="20" width="560" height="340" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2"/>
      <rect x="40" y="50" width="120" height="150" rx="8" fill="#334155"/>
      <circle cx="100" cy="110" r="35" fill="#64748B"/>
      <path d="M60 180 Q100 150 140 180" stroke="#64748B" stroke-width="12" fill="none"/>
      <text x="180" y="80" fill="#F8FAFC" font-family="sans-serif" font-size="18" font-weight="bold">INSTITUTIONAL CREDENTIAL CARD</text>
      <text x="180" y="110" fill="#38BDF8" font-family="sans-serif" font-size="14" font-weight="bold">${assignedRole.toUpperCase()}</text>
      <text x="180" y="150" fill="#94A3B8" font-family="sans-serif" font-size="12">FULL NAME:</text>
      <text x="180" y="170" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="bold">${fullName}</text>
      <text x="180" y="210" fill="#94A3B8" font-family="sans-serif" font-size="12">REGISTRATION / REF ID:</text>
      <text x="180" y="230" fill="#38BDF8" font-family="monospace" font-size="16" font-weight="bold">${officialId}</text>
      <text x="180" y="270" fill="#94A3B8" font-family="sans-serif" font-size="12">ISSUING BODY:</text>
      <text x="180" y="290" fill="#E2E8F0" font-family="sans-serif" font-size="13">${institution}</text>
      <rect x="40" y="310" width="520" height="30" rx="6" fill="#090D16"/>
      <text x="50" y="330" fill="#10B981" font-family="monospace" font-size="11">SECURITY MARK: ZERO-KNOWLEDGE VERIFIED — KYBER-1024 SHA-256</text>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const file = new File([blob], 'sample_id.svg', { type: 'image/svg+xml' });
    setSelectedImage(file);
    setImagePreview(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
    setImageQuality('good');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canContinueDetails) {
      setStep('password');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canContinuePassword) {
      if (assignedRole === 'Court Authority' || assignedRole === 'Independent Validator') {
        setStep('upload');
      } else {
        setStep('review');
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center font-sans overflow-x-hidden">
      
      {/* Top Left Logo to go back */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-[100] flex flex-col items-start gap-2">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group"
        >
          <LogoIcon className="w-8 h-8 group-hover:scale-105 transition-all duration-500 text-black" />
          <span className=" text-2xl font-bold tracking-tight transition-colors duration-500 text-black">
            Nyayakasha
          </span>
        </button>
      </div>

      <div className="w-full px-4 md:px-8 py-28 relative z-10 mx-auto">
        <AnimatePresence>
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white p-4 rounded-2xl shadow-2xl border border-black/10 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors w-[90%] max-w-sm"
              onClick={() => setStep('approved')}
            >
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
                <LogoIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black">Nyayakasha</h4>
                <p className="text-xs text-black/60 mt-0.5 leading-relaxed">Your account has been approved. Complete setup to continue.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: THE INVITE LINK */}
          {step === 'invite' && (
            <motion.div
              key="invite-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5 w-full flex flex-col items-center text-center max-w-2xl mx-auto"
            >
              {/* Role Preview Switcher Header */}
              <div className="w-full mb-6 p-1.5 bg-[#F5F5F5] rounded-2xl border border-black/5 flex items-center justify-between text-xs font-semibold">
                <span className="text-black/50 px-3 hidden sm:inline-block">Simulate Role Invite:</span>
                <div className="grid grid-cols-3 gap-1 w-full sm:w-auto flex-1">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Independent Validator')}
                    className={`py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                      assignedRole === 'Independent Validator'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    Independent Validator
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Court Authority')}
                    className={`py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                      assignedRole === 'Court Authority'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    Court Authority
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Field Submitter')}
                    className={`py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                      assignedRole === 'Field Submitter'
                        ? 'bg-black text-white shadow-sm'
                        : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    Field Submitter
                  </button>
                </div>
              </div>

              <div className="w-20 h-20 bg-black/5 rounded-3xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-black/80" />
              </div>
              
              <h1 className="text-3xl font-medium text-black mb-3" style={{ letterSpacing: '-0.02em' }}>
                Secure Institution Invitation
              </h1>

              <p className="text-black/70 text-base leading-relaxed mb-6">
                You've been invited to join <strong className="text-black font-semibold">NYAYAKASHA</strong> as an <strong className="text-black font-semibold">{assignedRole}</strong> at <strong className="text-black font-semibold">{institution}</strong>.
              </p>

              {/* Structural Independence Highlight Banner for Independent Validator */}
              {assignedRole === 'Independent Validator' && (
                <div className="w-full bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 mb-6 text-left flex items-start gap-3 text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold uppercase tracking-wider text-emerald-800 block">
                      STRUCTURALLY INDEPENDENT OVERSIGHT ROLE
                    </span>
                    <p className="leading-relaxed text-emerald-900/90">
                      Issued directly by the <strong>Bar Council office</strong> or <strong>Citizen-Oversight Committee</strong>. Notably, this is the <em>only role</em> where the inviting body is <strong>neither a court nor a police institution</strong>—ensuring completely neutral, uncompromised peer validation over evidence records.
                    </p>
                  </div>
                </div>
              )}

              <div className="w-full bg-[#F5F5F5] rounded-2xl p-5 mb-8 text-left border border-black/5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Invitee Name</p>
                  <p className="text-base font-medium text-black/90">{fullName}</p>
                </div>
                <div className="h-px w-full bg-black/5"></div>
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Assigned Role</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium text-black/90">{assignedRole}</p>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border border-emerald-200">
                      Verified Invitation
                    </span>
                  </div>
                </div>
                <div className="h-px w-full bg-black/5"></div>
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Inviting Institution</p>
                  <div className="flex items-center gap-2 text-black/90 font-medium">
                    <Building2 className="w-4 h-4 text-black/40" />
                    {institution}
                  </div>
                </div>
                <div className="h-px w-full bg-black/5"></div>
                <div>
                  <p className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-1">Issuing Body Authority</p>
                  <p className="text-base font-medium text-black/90">
                    {assignedRole === 'Field Submitter' 
                      ? 'Department Admin / Station House Officer (SHO)' 
                      : assignedRole === 'Court Authority' 
                      ? 'Court Registrar / High Court IT Cell' 
                      : 'Bar Council Executive Office & Citizen Oversight Secretariat'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setStep('details')}
                className="w-full bg-black text-white rounded-xl py-4 text-base font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                Accept Invitation &amp; Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* SCREEN 2: IDENTITY DETAILS */}
          {step === 'details' && (
            <motion.div
              key="details-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="mb-8">
                <button 
                  type="button"
                  onClick={() => setStep('invite')}
                  className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 mb-4 transition-colors cursor-pointer"
                >
                  &larr; Back to Invite
                </button>
                <h2 className="text-3xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Identity Details Verification
                </h2>
                <p className="text-black/60 text-base">
                  Verify your structural credentials before generating post-quantum cryptographic keys.
                </p>
              </div>

              {/* Validator Subtype Switcher for Independent Validator */}
              {assignedRole === 'Independent Validator' && (
                <div className="mb-6 bg-white p-4 rounded-2xl border border-black/10 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-black/60">
                      Select Independent Validator Body
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Non-Police / Non-Court
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSubtypeChange('bar_side')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        validatorSubtype === 'bar_side'
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-[#F5F5F5] text-black/70 border-black/5 hover:bg-black/5'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-0.5">Bar-Side Validator</span>
                      <span className={`text-[11px] block ${validatorSubtype === 'bar_side' ? 'text-white/70' : 'text-black/50'}`}>
                        Bar Council Membership Reg.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubtypeChange('citizen_side')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        validatorSubtype === 'citizen_side'
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-[#F5F5F5] text-black/70 border-black/5 hover:bg-black/5'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-0.5">Citizen-Side Validator</span>
                      <span className={`text-[11px] block ${validatorSubtype === 'citizen_side' ? 'text-white/70' : 'text-black/50'}`}>
                        Oversight-Panel Appointment
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-6 w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5">
                
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black/80 flex justify-between">
                    Full Name
                    {isNameValid && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-base"
                    />
                  </div>
                  <p className="text-xs text-black/40">Pre-filled from invitation manifest. Editable for corrections.</p>
                </div>

                {/* Official ID 1: Bar Enrollment / Badge Number / Bar Membership */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black/80 flex justify-between">
                    {assignedRole === 'Field Submitter' 
                      ? 'Official Police ID / Badge Number' 
                      : assignedRole === 'Court Authority' 
                      ? '1. Bar Enrollment Number (Registry 1)' 
                      : validatorSubtype === 'bar_side'
                      ? 'Bar Council Membership Number'
                      : 'Oversight-Panel Appointment Reference'}
                    {isIdValid && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                      <BadgeInfo className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      value={officialId}
                      onChange={(e) => setOfficialId(e.target.value)}
                      placeholder={
                        assignedRole === 'Field Submitter' 
                          ? "e.g. MH-POL-29384" 
                          : assignedRole === 'Court Authority' 
                          ? "e.g. MAH/1234/2010" 
                          : validatorSubtype === 'bar_side'
                          ? "e.g. BCM-MAH/8842/2018"
                          : "e.g. COP-GOI/2026-VAL-092"
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-base font-mono"
                    />
                  </div>
                  <p className="text-xs text-black/60 font-medium bg-[#F5F5F5] p-2.5 rounded-xl border border-black/5">
                    {assignedRole === 'Field Submitter' 
                      ? "Verified against Police Headquarters personnel directory." 
                      : assignedRole === 'Court Authority' 
                      ? "Cross-checked directly against the State Bar Council Database." 
                      : validatorSubtype === 'bar_side'
                      ? "Bar Council membership verified for independent legal peer-validation key distribution."
                      : "Gazette appointment reference cross-checked with the Citizen Oversight Committee registry."}
                  </p>
                </div>

                {/* Official ID 2: Judicial Appointment Record Number (Court Authority ONLY) */}
                {assignedRole === 'Court Authority' && (
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-amber-950 flex items-center gap-2">
                        <span>2. Judicial Appointment Record Number (Registry 2)</span>
                      </label>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                        Second Registry Check
                      </span>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-800/50 group-focus-within:text-amber-950 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        value={judicialApptId}
                        onChange={(e) => setJudicialApptId(e.target.value)}
                        placeholder="e.g. HCJ-APPT-2018-0942" 
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all text-base font-mono text-amber-950"
                      />
                    </div>
                    <p className="text-xs text-amber-900/80 leading-relaxed mt-1">
                      <strong>Dual Registry Cross-Verification:</strong> Court Authority credentials are cross-checked against <em>two independent registries</em>—the Bar Council Database AND the High Court Judicial Appointments Record—ensuring complete judicial authenticity.
                    </p>
                  </div>
                )}

                {/* Official Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black/80 flex justify-between">
                    Official Email
                    {isEmailValid && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. officer.name@police.gov.in"
                      className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-base font-medium text-black"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black/80 flex justify-between">
                    Phone Number
                    {isPhoneValid && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-base"
                    />
                  </div>
                  <p className="text-xs text-black/40">Required for multi-factor authentication (MFA) and consensus vote signing.</p>
                </div>

                <button 
                  type="submit"
                  disabled={!canContinueDetails}
                  className={`w-full rounded-xl py-4 text-base font-semibold transition-all flex items-center justify-center gap-2 mt-2 ${
                    canContinueDetails 
                      ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' 
                      : 'bg-black/10 text-black/40 cursor-not-allowed'
                  }`}
                >
                  Continue to Password Creation
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </form>
            </motion.div>
          )}

          {/* SCREEN 3: PASSWORD CREATION */}
          {step === 'password' && (
            <motion.div
              key="password-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              <div className="mb-10 text-left">
                <button 
                  onClick={() => setStep('details')}
                  className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 mb-6 transition-colors"
                >
                  &larr; Back to Details
                </button>
                <h2 className="text-3xl  text-black mb-3">Secure Your Account</h2>
                <p className="text-black/60 text-base">Create a strong password for your Nyayakasha account.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-8 w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5">
                
                {/* Create Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black/80 flex justify-between">
                    Create Password
                    {isPasswordValid && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                      className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-base"
                    />
                  </div>

                  {/* Password Strength Meter & Warning */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-black/60">Strength</span>
                        <span className={`${strength >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                          {strengthLabels[strength]}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1.5 w-full">
                        {[1, 2, 3, 4].map((level) => (
                          <div 
                            key={level} 
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              strength >= level ? strengthColors[strength] : 'bg-black/10'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {isBreached && (
                        <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg mt-2 text-sm font-medium border border-red-100">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <p>This password has appeared in a data breach. Please choose another.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Checklist */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rules.map((rule, idx) => (
                      <div key={idx} className={`flex items-center gap-2 text-sm transition-colors ${rule.valid ? 'text-green-600' : 'text-black/40'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${rule.valid ? 'border-green-600 bg-green-50' : 'border-black/20'}`}>
                          {rule.valid && <Check className="w-3 h-3 text-green-600 stroke-[3]" />}
                        </div>
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-black/80 flex justify-between">
                    Confirm Password
                    {doPasswordsMatch && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-black/5 transition-all text-base ${
                        confirmPassword.length > 0 && !doPasswordsMatch 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-50' 
                          : 'border-transparent focus:border-black/20'
                      }`}
                    />
                  </div>
                  {confirmPassword.length > 0 && !doPasswordsMatch && (
                    <p className="text-red-500 text-xs font-medium mt-1">Passwords do not match.</p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={!canContinuePassword}
                  className={`w-full rounded-xl py-4 text-base font-semibold transition-all flex items-center justify-center gap-2 mt-4 ${
                    canContinuePassword 
                      ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' 
                      : 'bg-black/10 text-black/40 cursor-not-allowed'
                  }`}
                >
                  {assignedRole === 'Field Submitter' ? 'Complete Registration' : 'Continue to ID Upload'}
                  {assignedRole !== 'Field Submitter' && <ArrowRight className="w-5 h-5 ml-1" />}
                </button>
              </form>
            </motion.div>
          )}

          {/* SCREEN 4: UPLOAD ID */}
          {step === 'upload' && (
            <motion.div
              key="upload-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl mx-auto text-left"
            >
              <div className="mb-8">
                <button 
                  onClick={() => setStep('password')}
                  className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 mb-4 transition-colors cursor-pointer"
                >
                  &larr; Back to Password
                </button>
                <h2 className="text-3xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Upload ID Document
                </h2>
                <p className="text-black/60 text-base">
                  Please provide a clear photo of your government or institutional credential card ({assignedRole === 'Independent Validator' ? 'Bar Council ID / Citizen Oversight Appointment Letter' : 'Judicial Badge / Court Identity Card'}).
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5">
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full h-64 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${
                    isDragging 
                      ? 'border-black bg-black/5' 
                      : imagePreview 
                        ? 'border-transparent bg-black/5' 
                        : 'border-black/20 bg-[#F5F5F5] hover:border-black/40'
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="ID Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button 
                          onClick={clearImage}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full p-3 transition-colors cursor-pointer"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <p className="text-white text-sm font-medium mt-2">Remove Image</p>
                      </div>
                      
                      {imageQuality === 'checking' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-black mb-2" />
                          <p className="text-sm font-semibold text-black">Checking image quality...</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center px-6">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <UploadCloud className="w-8 h-8 text-black/60" />
                      </div>
                      <p className="text-base font-semibold text-black mb-1">Drag and drop your credential card photo</p>
                      <p className="text-sm text-black/50 mb-4">or select a sample document for testing</p>
                      
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <label className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer shadow-lg shadow-black/10">
                          Browse File
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>

                        <button
                          type="button"
                          onClick={loadSampleImage}
                          className="bg-[#F5F5F5] border border-black/10 text-black/80 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black/5 hover:text-black transition-colors cursor-pointer"
                        >
                          Use Sample {assignedRole === 'Independent Validator' ? 'Bar ID' : 'Judicial ID'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quality Indicator */}
                {imageQuality && imageQuality !== 'checking' && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                    imageQuality === 'good' ? 'bg-green-50 border-green-100 text-green-800' : 
                    imageQuality === 'blurry' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                    'bg-red-50 border-red-100 text-red-800'
                  }`}>
                    {imageQuality === 'good' ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 shrink-0 ${imageQuality === 'blurry' ? 'text-amber-600' : 'text-red-600'}`} />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold mb-0.5">
                        {imageQuality === 'good' ? 'ID Document verified' : 
                         imageQuality === 'blurry' ? 'Image is too blurry' :
                         'Image is too dark'}
                      </h4>
                      <p className="text-xs opacity-80 leading-relaxed">
                        {imageQuality === 'good' ? 'Credential card text & official seal meet institutional clarity standards.' : 
                         imageQuality === 'blurry' ? 'Please upload a clearer photo where all text is highly legible.' :
                         'Please upload a photo taken in better lighting.'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 bg-[#F5F5F5] p-4 rounded-xl border border-black/5">
                  <Info className="w-5 h-5 text-black/40 shrink-0 mt-0.5" />
                  <p className="text-xs text-black/60 font-medium leading-relaxed">
                    This document is cross-checked against official institution registries by authorized secretariats. It is strictly confidential and never stored in cleartext.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    if (assignedRole === 'Independent Validator') {
                      setStep('vetting');
                    } else {
                      setStep('review');
                    }
                  }}
                  disabled={!selectedImage || imageQuality !== 'good'}
                  className={`w-full rounded-xl py-4 text-base font-semibold transition-all flex items-center justify-center gap-2 ${
                    selectedImage && imageQuality === 'good'
                      ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' 
                      : 'bg-black/10 text-black/40 cursor-not-allowed'
                  }`}
                >
                  {assignedRole === 'Independent Validator' ? 'Continue to Vetting Consent' : 'Continue to Review'}
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 4.5: VETTING CONSENT (UNIQUE TO INDEPENDENT VALIDATOR) */}
          {step === 'vetting' && (
            <motion.div
              key="vetting-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl mx-auto text-left"
            >
              <div className="mb-8">
                <button 
                  onClick={() => setStep('upload')}
                  className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 mb-4 transition-colors cursor-pointer"
                >
                  &larr; Back to ID Upload
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Unique Role Requirement</span>
                </div>
                <h2 className="text-3xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Background Vetting &amp; Key Share Authorization
                </h2>
                <p className="text-black/60 text-base leading-relaxed">
                  Because Independent Validators hold a threshold shard of the analytics decryption key, an automated credential vetting check is mandatory prior to key distribution.
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5">
                {/* Key Share Notice Banner */}
                <div className="p-5 rounded-2xl bg-[#F5F5F5] border border-black/5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h3 className="font-bold text-black text-sm uppercase tracking-wide">
                      Decryption Key Share Holder Status
                    </h3>
                  </div>
                  <p className="text-xs text-black/70 leading-relaxed">
                    As an Independent Validator, your public key will participate in threshold decryption operations for zero-knowledge evidence logs and oversight audits. This ensures no court or police officer can decrypt confidential dockets without independent oversight.
                  </p>
                </div>

                {/* What is Being Checked */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-black/50">
                    What Is Being Vetted &amp; Verified
                  </h4>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-black/5 bg-white shadow-2xs flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-black/5 text-black shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-black mb-0.5">
                          {validatorSubtype === 'bar_side' ? 'Bar Council Standing & Registration' : 'Oversight Panel Appointment Record'}
                        </h5>
                        <p className="text-xs text-black/60 leading-relaxed">
                          {validatorSubtype === 'bar_side'
                            ? 'Verifies active enrollment with the State Bar Council and confirms zero pending professional misconduct or suspension orders.'
                            : 'Validates official gazette notification reference and appointment order from the Citizen Judicial Oversight Board.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-black/5 bg-white shadow-2xs flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-black/5 text-black shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-black mb-0.5">
                          Conflict of Interest Screening
                        </h5>
                        <p className="text-xs text-black/60 leading-relaxed">
                          Automated cross-referencing against state litigation databases to prevent conflict of interest in active case dockets you may validate.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-black/5 bg-white shadow-2xs flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-black/5 text-black shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-black mb-0.5">
                          Identity &amp; Credential Authentication
                        </h5>
                        <p className="text-xs text-black/60 leading-relaxed">
                          Sanitize and confirm government ID credentials to prevent impersonation or unauthorized key share allocation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mandatory Single Consent Checkbox */}
                <label className="flex items-start gap-4 p-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 cursor-pointer group transition-all hover:bg-emerald-50">
                  <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 appearance-none border-2 border-emerald-400 rounded-md checked:bg-emerald-700 checked:border-emerald-700 transition-colors peer cursor-pointer"
                      checked={vettingConsent}
                      onChange={(e) => setVettingConsent(e.target.checked)}
                    />
                    <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                  </div>
                  <div className="text-xs text-emerald-950 font-medium leading-relaxed select-none">
                    <span className="font-bold block mb-1 text-emerald-900">
                      Authorization &amp; Consent Statement
                    </span>
                    I authorize the Bar Council Oversight Secretariat &amp; Nyayakasha Governance Board to execute an automated background credential check for my threshold analytics decryption key share.
                  </div>
                </label>

                {/* Continue Button */}
                <button 
                  onClick={() => setStep('review')}
                  disabled={!vettingConsent}
                  className={`w-full rounded-xl py-4 text-base font-semibold transition-all flex items-center justify-center gap-2 ${
                    vettingConsent
                      ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' 
                      : 'bg-black/10 text-black/40 cursor-not-allowed'
                  }`}
                >
                  Continue to Review &amp; Submit
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 5: REVIEW & SUBMIT */}
          {step === 'review' && (
            <motion.div
              key="review-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl mx-auto text-left"
            >
              <div className="mb-8">
                <button 
                  onClick={() => setStep(assignedRole === 'Independent Validator' ? 'vetting' : assignedRole === 'Field Submitter' ? 'password' : 'upload')}
                  className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 mb-4 transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <h2 className="text-3xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Review &amp; Submit Application
                </h2>
                <p className="text-black/60 text-base">Please review your credentials and consents before final cryptographic submission.</p>
              </div>

              <div className="flex flex-col gap-6 w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5">
                
                {/* Identity Summary */}
                <div className="border border-black/10 rounded-2xl p-5 bg-[#F9F9F9] relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-black/60" />
                      <h3 className="font-semibold text-black">Identity Details</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-black/5 px-2 py-0.5 rounded-full text-black/70">
                        {assignedRole}
                      </span>
                    </div>
                    <button 
                      onClick={() => setStep('details')}
                      className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-black/50 font-medium mb-1">Full Name</p>
                      <p className="text-black font-medium">{fullName}</p>
                    </div>
                    <div>
                      <p className="text-black/50 font-medium mb-1">Official ID / Ref</p>
                      <p className="text-black font-medium font-mono">{officialId}</p>
                    </div>
                    <div>
                      <p className="text-black/50 font-medium mb-1">Phone</p>
                      <p className="text-black font-medium">{phone}</p>
                    </div>
                    <div>
                      <p className="text-black/50 font-medium mb-1">Email</p>
                      <p className="text-black font-medium">{email}</p>
                    </div>
                  </div>
                </div>

                {/* Password Summary */}
                <div className="border border-black/10 rounded-2xl p-5 bg-[#F9F9F9] relative group flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <KeyRound className="w-5 h-5 text-black/60" />
                    <div>
                      <h3 className="font-semibold text-black mb-0.5">Password</h3>
                      <p className="text-black/60 text-sm font-mono">••••••••••••</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep('password')}
                    className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>

                {/* ID Document Summary (If applicable) */}
                {assignedRole !== 'Field Submitter' && (
                  <div className="border border-black/10 rounded-2xl p-5 bg-[#F9F9F9] relative group flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-black/60" />
                      <div>
                        <h3 className="font-semibold text-black mb-0.5">Credential Document</h3>
                        <p className="text-black/60 text-sm">Image uploaded and verified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-black/10">
                          <img src={imagePreview} alt="Thumb" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <button 
                        onClick={() => setStep('upload')}
                        className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                    </div>
                  </div>
                )}

                {/* Vetting Consent Summary (For Independent Validator) */}
                {assignedRole === 'Independent Validator' && (
                  <div className="border border-emerald-200 rounded-2xl p-5 bg-emerald-50/50 relative group flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-emerald-950 text-sm">
                            Background Vetting Authorized
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                            Signed
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800/80 leading-relaxed">
                          Authorized background check for threshold analytics decryption key share allocation.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setStep('vetting')}
                      className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  </div>
                )}

                {/* Terms Acknowledgment */}
                <label className="flex items-start gap-4 p-4 rounded-xl border border-black/5 bg-[#F5F5F5] cursor-pointer group mt-2">
                  <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 appearance-none border-2 border-black/20 rounded-md checked:bg-black checked:border-black transition-colors peer cursor-pointer"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                  </div>
                  <p className="text-sm text-black/80 font-medium leading-relaxed select-none group-hover:text-black transition-colors">
                    I confirm that all details provided are accurate and understand my data will be handled according to Nyayakasha's secure institutional policies.
                    {assignedRole === 'Field Submitter' && ' I understand that my access is strictly geofenced to my assigned operational jurisdiction.'}
                    {assignedRole === 'Independent Validator' && ' I acknowledge my responsibility as a key-shard holder for encrypted records.'}
                  </p>
                </label>

                {/* Error Alert Banner */}
                {signupError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
                    <span>{signupError}</span>
                    <button type="button" onClick={() => setSignupError(null)} className="text-red-900 font-bold ml-2">✕</button>
                  </div>
                )}

                <button 
                  onClick={async () => {
                    setSignupError(null);
                    setIsSubmitting(true);
                    try {
                      const backendRole = assignedRole === 'Field Submitter' 
                        ? 'field_submitter' 
                        : assignedRole === 'Court Authority' 
                          ? 'court_authority' 
                          : 'independent_validator';

                      if (!email || !email.includes('@')) {
                        throw new Error('Please enter a valid Official Email address.');
                      }

                      if (!password || password.length < 8) {
                        throw new Error('Please enter a password with at least 8 characters (including uppercase, number, and symbol).');
                      }

                      if (!fullName || fullName.trim().length < 3) {
                        throw new Error('Please enter your full name.');
                      }

                      await api.signup({
                        email: email.trim().toLowerCase(),
                        password,
                        fullName,
                        role: backendRole,
                        badgeId: officialId || (backendRole === 'field_submitter' ? `POL-MH-${Math.floor(10000 + Math.random() * 90000)}` : `BCM-MH-${Math.floor(10000 + Math.random() * 90000)}`),
                        barCouncilNumber: officialId || (backendRole === 'field_submitter' ? `POL-MH-${Math.floor(10000 + Math.random() * 90000)}` : `BCM-MH-${Math.floor(10000 + Math.random() * 90000)}`),
                        institutionId: judicialApptId || officialId || (backendRole === 'field_submitter' ? `POL-WRT-2026-${Math.floor(1000 + Math.random() * 9000)}` : `HC-REG-2026-${Math.floor(1000 + Math.random() * 9000)}`),
                        jurisdictionCode: 'MH-MUM-DIST-01',
                        consentVetting: vettingConsent
                      });

                      if (selectedImage) {
                        await api.uploadDocument(selectedImage);
                      }

                      setStep('success');
                    } catch (err: any) {
                      console.error('Signup error:', err);
                      setSignupError(err.message || 'Signup failed. Please verify your email and password.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={!acceptedTerms || isSubmitting}
                  className={`w-full rounded-xl py-4 text-base font-semibold transition-all flex items-center justify-center gap-2 mt-2 ${
                    acceptedTerms && !isSubmitting
                      ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' 
                      : 'bg-black/10 text-black/40 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Registering Account...' : 'Submit for verification'}
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 6: PENDING VERIFICATION */}
          {step === 'success' && (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5 w-full max-w-2xl mx-auto flex flex-col text-left"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-100/80 shadow-xs">
                  <ShieldCheck className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-3xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Pending Institutional Verification
                </h2>
                <p className="text-black/60 text-base leading-relaxed max-w-md mx-auto">
                  Your application is undergoing verification by <strong className="text-black">{institution}</strong>.
                </p>
              </div>

              {/* Unique Microcopy for Independent Validator or Court Authority */}
              {assignedRole === 'Independent Validator' && (
                <div className="mb-8 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-amber-950">
                  <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">
                    <strong className="text-amber-900 block mb-0.5">Thorough Oversight Vetting Process</strong>
                    This role holds oversight responsibilities and requires a more thorough verification process, including Bar registry verification and key-share clearance.
                  </p>
                </div>
              )}

              {assignedRole === 'Court Authority' && (
                <div className="mb-8 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-amber-950">
                  <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">
                    <strong className="text-amber-900 block mb-0.5">Dual-Registry Verification Mandatory</strong>
                    This role requires verification against two independent records (State Bar Council Database &amp; Judicial Appointments Record) and may take slightly longer.
                  </p>
                </div>
              )}

              {/* Progress Tracker: 4-Step for Independent Validator & Court Authority vs 3-Step for Field Submitter */}
              <div className="mb-8 p-6 rounded-2xl bg-[#F9F9F9] border border-black/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-6">
                  Verification Lifecycle Stage
                </h4>

                {assignedRole === 'Court Authority' ? (
                  /* 4-Stage Tracker for Court Authority Dual-Registry Check */
                  <div className="flex flex-col gap-6 relative before:absolute before:inset-y-3 before:left-3.5 before:w-0.5 before:bg-black/10 px-1">
                    {/* Stage 1 */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-black">1. Submitted</h4>
                        <p className="text-xs text-black/60 mt-0.5">Application &amp; dual-registry credentials received</p>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">2. Registrar Review</h4>
                        <p className="text-xs text-black/60 mt-0.5">High Court Registrar &amp; IT Cell initial identity review</p>
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-[#EAEAEA] flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                        <div className="w-2 h-2 bg-black/20 rounded-full" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-black/50">3. Judicial Record Check</h4>
                        <p className="text-xs text-black/40 mt-0.5">Cross-verification against Bar Council &amp; Judicial Appointment ledger</p>
                      </div>
                    </div>

                    {/* Stage 4 */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-[#EAEAEA] flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-black/40">4. Approved</h4>
                        <p className="text-xs text-black/30 mt-0.5">Judicial Bench clearance &amp; session key distribution</p>
                      </div>
                    </div>
                  </div>
                ) : assignedRole === 'Independent Validator' ? (
                  /* 4-Stage Tracker for Independent Validator */
                  <div className="flex flex-col gap-6 relative before:absolute before:inset-y-3 before:left-3.5 before:w-0.5 before:bg-black/10 px-1">
                    {/* Stage 1 */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-black">1. Submitted</h4>
                        <p className="text-xs text-black/60 mt-0.5">Application &amp; ID credentials received in queue</p>
                      </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">2. Institutional Check</h4>
                        <p className="text-xs text-black/60 mt-0.5">Bar Council standing &amp; active registration cross-check</p>
                      </div>
                    </div>

                    {/* Stage 3 */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-[#EAEAEA] flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                        <div className="w-2 h-2 bg-black/20 rounded-full" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-black/50">3. Background Vetting</h4>
                        <p className="text-xs text-black/40 mt-0.5">Conflict-of-interest screening &amp; key-share clearance</p>
                      </div>
                    </div>

                    {/* Stage 4 */}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-[#EAEAEA] flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-black/40">4. Committee Approval</h4>
                        <p className="text-xs text-black/30 mt-0.5">Final oversight board sign-off &amp; WebAuthn key dispatch</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard 3-Stage Tracker for Court Authority / Field Submitter */
                  <div className="flex flex-col gap-6 relative before:absolute before:inset-y-3 before:left-3.5 before:w-0.5 before:bg-black/10 px-1">
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-black">Submitted</h4>
                        <p className="text-xs text-black/60 mt-0.5">Application received</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Under Review</h4>
                        <p className="text-xs text-black/60 mt-0.5">Department authority verifying credentials</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-[#EAEAEA] flex items-center justify-center border-4 border-white shadow-xs shrink-0">
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-black/40">Approved</h4>
                        <p className="text-xs text-black/30 mt-0.5">Access granted to Nyayakasha</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-0.5">Estimated Turnaround</h4>
                  <p className="text-xs text-blue-800/80 leading-relaxed">
                    {assignedRole === 'Independent Validator' 
                      ? 'Typically reviewed within 3–5 business days by the Oversight Board. You will receive an email once approved.'
                      : 'Typically reviewed within 1–2 business days. You will receive an email notification upon approval.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 7: APPROVED */}
          {step === 'approved' && (
            <motion.div
              key="approved-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5 w-full max-w-xl mx-auto flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-medium text-black mb-3" style={{ letterSpacing: '-0.02em' }}>
                Account Approved
              </h2>
              <p className="text-black/60 text-base leading-relaxed mb-8 max-w-md mx-auto">
                {assignedRole === 'Independent Validator'
                  ? 'Your Bar Council & Oversight Committee credentials have been verified. You can now set up your mandatory hardware security key to access your workspace.'
                  : 'Your institution has successfully verified your identity. You can now complete your security setup to enter your workspace.'}
              </p>
              
              <button 
                onClick={() => setStep('mfa')}
                className="w-full rounded-xl py-4 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                Enter Nyayakasha
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </motion.div>
          )}

          {/* SCREEN 8: MANDATORY MFA ENROLLMENT */}
          {step === 'mfa' && (
            <motion.div
              key="mfa-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl mx-auto text-left"
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-black/80 text-xs font-bold uppercase tracking-wider mb-3 border border-black/5">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span>Mandatory Security Enrolment</span>
                </div>
                <h2 className="text-3xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  {assignedRole === 'Independent Validator'
                    ? 'Hardware-Attested WebAuthn MFA'
                    : assignedRole === 'Court Authority'
                    ? 'Mandatory Biometric / Passkey Authentication'
                    : 'Secure Your Account'}
                </h2>
                <p className="text-black/60 text-base leading-relaxed">
                  {assignedRole === 'Independent Validator' ? (
                    <>
                      This role requires a <strong>hardware-backed security key</strong>, since it holds a share of the platform's encryption keys.
                    </>
                  ) : assignedRole === 'Court Authority' ? (
                    <>
                      This role requires biometric authentication — no alternative method is available, to protect the integrity of judicial approvals.
                    </>
                  ) : (
                    'Mandatory Multi-Factor Authentication (MFA) is required for all personnel accessing Nyayakasha.'
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5">
                
                {/* Independent Validator: Hardware-Attested WebAuthn ONLY */}
                {assignedRole === 'Independent Validator' ? (
                  <div className="space-y-6">
                    {/* Microcopy Banner */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3">
                      <KeyRound className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed space-y-1">
                        <span className="font-bold uppercase tracking-wider text-amber-900 block">
                          CRITICAL DECRYPTION KEY SHARE HOLDER
                        </span>
                        <p>
                          This role requires a hardware-backed security key, since it holds a share of the platform's encryption keys. Software authenticator apps (TOTP) are disabled for Independent Validators to prevent credential relay attacks.
                        </p>
                      </div>
                    </div>

                    {mfaMethod === 'select' && (
                      <div className="space-y-4">
                        <button 
                          type="button"
                          onClick={() => {
                            setMfaMethod('enrolling');
                            setTimeout(() => {
                              setMfaMethod('success');
                              setTimeout(() => {
                                setStep('keys'); // Skip duress PIN for Independent Validator
                              }, 1500);
                            }, 2000);
                          }}
                          className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-black bg-white hover:bg-gray-50 transition-all text-left group shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center shrink-0">
                              <Fingerprint className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-bold text-black">
                                  Register Physical Security Key / Hardware Passkey
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                                  FIDO2 / WebAuthn
                                </span>
                              </div>
                              <p className="text-xs text-black/60">
                                YubiKey, Google Titan Key, or Platform TPM/Secure Enclave hardware attestation
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
                        </button>

                        <div className="p-4 rounded-xl border border-black/5 bg-[#F9F9F9] flex items-center justify-between text-xs text-black/50 font-medium">
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-black/40" />
                            Software TOTP App Fallback:
                          </span>
                          <span className="font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            Disabled For Key Holders
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : assignedRole === 'Court Authority' ? (
                  /* Court Authority: Biometric/WebAuthn ONLY (No TOTP option available) */
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed space-y-1">
                        <span className="font-bold uppercase tracking-wider text-amber-900 block">
                          Judicial Bench Security Policy
                        </span>
                        <p>
                          This role requires biometric authentication — no alternative method is available, to protect the integrity of judicial approvals and Layer 3 identity-unlock authorizations.
                        </p>
                      </div>
                    </div>

                    {mfaMethod === 'select' && (
                      <div className="space-y-4">
                        <button 
                          type="button"
                          onClick={() => {
                            setMfaMethod('enrolling');
                            setTimeout(() => {
                              setMfaMethod('success');
                              setTimeout(() => {
                                setStep('duress');
                              }, 1500);
                            }, 2000);
                          }}
                          className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-black bg-white hover:bg-gray-50 transition-all text-left group shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center shrink-0">
                              <Fingerprint className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-bold text-black">
                                  Enroll Platform Biometric / Touch ID / Face ID
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                                  Single Authorized Option
                                </span>
                              </div>
                              <p className="text-xs text-black/60">
                                Hardware-backed TPM biometric enrolment for judicial bench authorization
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
                        </button>

                        <div className="p-4 rounded-xl border border-black/5 bg-[#F9F9F9] flex items-center justify-between text-xs text-black/50 font-medium">
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-black/40" />
                            Software TOTP App Fallback:
                          </span>
                          <span className="font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unavailable for Judicial Bench
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Field Submitter: Standard choice between Biometric & TOTP */
                  mfaMethod === 'select' && (
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => {
                          setMfaMethod('enrolling');
                          setTimeout(() => {
                            setMfaMethod('success');
                            setTimeout(() => {
                              setStep('duress');
                            }, 1500);
                          }, 2000);
                        }}
                        className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-black hover:bg-gray-50 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                            <Fingerprint className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-black mb-1">
                              Set up with your fingerprint or passkey
                            </h4>
                            <p className="text-sm text-black/60">
                              Fastest and most secure way to sign in
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all" />
                      </button>

                      <button 
                        onClick={() => setMfaMethod('totp')}
                        className="w-full flex items-center justify-between p-5 rounded-2xl border border-black/10 hover:border-black/30 hover:bg-gray-50 transition-colors text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                            <Smartphone className="w-5 h-5 text-black/60 group-hover:text-black transition-colors" />
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-black/80">Use an authenticator app instead</h4>
                            <p className="text-xs text-black/50">Google Authenticator, Authy, etc.</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-black/30 group-hover:text-black group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                  )
                )}

                {/* Enrolling State */}
                {mfaMethod === 'enrolling' && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Fingerprint className="w-16 h-16 text-black animate-pulse mb-6" />
                    <h3 className="text-xl font-bold text-black mb-2">
                      {assignedRole === 'Independent Validator' ? 'Attesting WebAuthn Key...' : 'Enrolling Biometric Passkey...'}
                    </h3>
                    <p className="text-black/60 text-sm">
                      {assignedRole === 'Independent Validator' 
                        ? 'Touch your physical security key or verify hardware biometric.' 
                        : 'Please follow your device prompt to verify biometric identity.'}
                    </p>
                  </div>
                )}
                
                {/* Success State */}
                {mfaMethod === 'success' && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-200">
                      <Check className="w-8 h-8 text-emerald-600 stroke-[3]" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      {assignedRole === 'Court Authority' ? 'Judicial Biometric Enrolled' : 'Hardware Key Registered'}
                    </h3>
                    <p className="text-black/50 text-sm">Proceeding to security PIN setup...</p>
                  </div>
                )}

                {/* TOTP State (Only reachable by Field Submitter) */}
                {mfaMethod === 'totp' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => setMfaMethod('select')}
                        className="text-black/50 hover:text-black text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        &larr; Back
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center border border-black/5 bg-[#F9F9F9] p-6 rounded-2xl">
                      <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm border border-black/10 shrink-0 flex items-center justify-center">
                        <QrCode className="w-40 h-40 text-black" strokeWidth={1} />
                      </div>
                      <div className="w-full">
                        <h4 className="font-semibold text-black mb-2">1. Scan the QR code</h4>
                        <p className="text-sm text-black/60 mb-4 leading-relaxed">
                          Open your authenticator app and scan this QR code to add your Nyayakasha account.
                        </p>
                        
                        <h4 className="font-semibold text-black mb-2">2. Or enter setup key manually</h4>
                        <div className="flex items-center gap-2 bg-white border border-black/10 p-3 rounded-lg w-full">
                          <code className="text-xs font-mono text-black">AJS8 29DJ N283 JSK9</code>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-black/80">
                        3. Enter the 6-digit code
                      </label>
                      <input 
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        onChange={(e) => {
                          if (e.target.value.length === 6) {
                            setMfaMethod('success');
                            setTimeout(() => setStep('duress'), 1500);
                          }
                        }}
                        className="w-full px-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-base tracking-widest font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN 9: DURESS PIN */}
          {step === 'duress' && (
            <motion.div
              key="duress-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full text-left"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                  {assignedRole === 'Court Authority'
                    ? 'Optional Quick-Access PIN Setup'
                    : 'Set up two PINs for quick access'}
                </h2>
                <p className="text-black/60 text-base leading-relaxed">
                  {assignedRole === 'Court Authority'
                    ? 'As a judicial authority, duress PIN protection is optional based on your court bench security protocol.'
                    : 'You can use these PINs to quickly unlock your workspace without entering your full password.'}
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5">
                
                {/* Court Authority Opt-In Toggle */}
                {assignedRole === 'Court Authority' && (
                  <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-black/5 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-black block">
                        Would you like to set up a secondary quick-access PIN?
                      </span>
                      <span className="text-xs text-black/50">
                        Optional for Court Authority. Provides dual-PIN duress safety if enabled.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input 
                        type="checkbox" 
                        checked={enableOptInPin}
                        onChange={(e) => setEnableOptInPin(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                )}

                {/* PIN Input fields (Required for Field Submitter, or if enabled for Court Authority) */}
                {(assignedRole === 'Field Submitter' || enableOptInPin) && (
                  <>
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-semibold text-black">PIN 1 (Standard Quick-Access)</label>
                         <input 
                           type="password"
                           maxLength={4}
                           placeholder="••••"
                           value={pin1}
                           onChange={(e) => setPin1(e.target.value.replace(/\D/g, ''))}
                           className="w-full px-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-xl tracking-[1em] font-mono text-center"
                         />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-semibold text-black">PIN 2 (Duress Code)</label>
                         <input 
                           type="password"
                           maxLength={4}
                           placeholder="••••"
                           value={pin2}
                           onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))}
                           className="w-full px-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-xl tracking-[1em] font-mono text-center"
                         />
                      </div>
                    </div>

                    <div className="border border-black/5 rounded-xl overflow-hidden mt-2">
                       <button 
                         onClick={() => setShowPinInfo(!showPinInfo)}
                         className="w-full p-4 flex items-center justify-between bg-[#F9F9F9] hover:bg-gray-100 transition-colors text-left cursor-pointer"
                       >
                         <span className="text-sm font-semibold text-black/70">Learn what these are for</span>
                         {showPinInfo ? <ChevronUp className="w-4 h-4 text-black/50" /> : <ChevronDown className="w-4 h-4 text-black/50" />}
                       </button>
                       <AnimatePresence>
                         {showPinInfo && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="px-4 pb-4 bg-[#F9F9F9]"
                            >
                               <p className="text-xs text-black/60 leading-relaxed pt-2 border-t border-black/5 mt-1">
                                 <strong className="text-black/80">PIN 1</strong> is your standard quick-access code.<br/><br/>
                                 <strong className="text-black/80">PIN 2</strong> is a duress code. If forced to unlock the app under coercion, entering PIN 2 silently signals distress to your institutional security while appearing to unlock the app normally.
                               </p>
                            </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-3 mt-2">
                  {(assignedRole === 'Field Submitter' || enableOptInPin) ? (
                    <button 
                      disabled={pin1.length < 4 || pin2.length < 4}
                      onClick={() => setStep('keys')}
                      className={`w-full rounded-xl py-4 text-base font-semibold transition-all flex items-center justify-center gap-2 ${
                        pin1.length === 4 && pin2.length === 4
                          ? 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl cursor-pointer' 
                          : 'bg-black/10 text-black/40 cursor-not-allowed'
                      }`}
                    >
                      Set PINs &amp; Continue
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setStep('keys')}
                      className="w-full rounded-xl py-4 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 transition-all text-base font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Skip PIN Setup &amp; Generate Cryptographic Keys
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </button>
                  )}
                  {assignedRole !== 'Field Submitter' && enableOptInPin && (
                    <button 
                      onClick={() => setStep('keys')}
                      className="w-full py-2.5 text-sm font-semibold text-black/50 hover:text-black transition-colors cursor-pointer text-center"
                    >
                      Skip PIN setup for now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 10: KEY GENERATION */}
          {step === 'keys' && (
            <motion.div
              key="keys-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5 flex flex-col items-center">
                 <div className="w-20 h-20 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-6 border border-black/5 relative">
                    {!keysGenerated ? (
                      <Loader2 className="w-8 h-8 text-black animate-spin" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-green-600" />
                    )}
                 </div>
                 
                 <h2 className="text-2xl  text-black mb-3">
                   {!keysGenerated ? "Securing Your Account" : "Keys Generated"}
                 </h2>
                 <p className="text-black/60 text-sm leading-relaxed mb-6">
                   {!keysGenerated 
                     ? "Generating client-side cryptographic keys and establishing your threshold-based recovery (2-of-3 sign-off)." 
                     : `Your device is securely paired. Your recovery co-signers are: ${assignedRole === 'Field Submitter' ? 'Department admin, Peer officer, System flag' : assignedRole === 'Court Authority' ? 'Registrar, Second judge, Bar Council rep' : 'Bar Council chair, Second validator, Department liaison'}.`}
                 </p>

                 {!keysGenerated ? (
                   <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: '100%' }}
                       transition={{ duration: 3, ease: 'easeInOut' }}
                       onAnimationComplete={() => setKeysGenerated(true)}
                       className="h-full bg-black"
                     />
                   </div>
                 ) : (
                   <button 
                      onClick={() => setStep('onboarding')}
                      className="w-full rounded-xl py-4 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base font-semibold flex items-center justify-center gap-2"
                   >
                     Continue
                     <ArrowRight className="w-5 h-5 ml-1" />
                   </button>
                 )}
              </div>
            </motion.div>
          )}

          {/* SCREEN 11: ONBOARDING WALKTHROUGH */}
          {step === 'onboarding' && (
            <motion.div
              key="onboarding-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full flex flex-col items-center text-center"
            >
              <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border border-black/5 flex flex-col items-center">
                 <div className="w-24 h-24 bg-[#F9F9F9] rounded-full flex items-center justify-center mb-6 border border-black/5">
                    {onboardingCards[onboardingStep].icon}
                 </div>
                 
                 <div className="flex gap-1.5 mb-8">
                   {onboardingCards.map((_, i) => (
                     <div key={i} className={`h-1.5 rounded-full transition-all ${i === onboardingStep ? 'w-6 bg-black' : 'w-2 bg-black/10'}`} />
                   ))}
                 </div>
                 
                 <h2 className="text-2xl  text-black mb-3">{onboardingCards[onboardingStep].title}</h2>
                 <p className="text-black/60 text-base leading-relaxed mb-10 h-16">
                   {onboardingCards[onboardingStep].desc}
                 </p>
                 
                 <div className="w-full">
                    {onboardingStep < onboardingCards.length - 1 ? (
                      <button 
                        onClick={() => setOnboardingStep(s => s + 1)}
                        className="w-full rounded-xl py-4 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base font-semibold flex items-center justify-center gap-2"
                      >
                        Next
                        <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          localStorage.setItem('nyayakasha_is_logged_in', 'true');
                          localStorage.setItem('nyayakasha_current_page', 'dashboard');
                          onNavigate('dashboard');
                        }}
                        className="w-full rounded-xl py-4 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base font-semibold flex items-center justify-center gap-2"
                      >
                        Go to my dashboard
                        <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    )}
                 </div>
                 
                 <button 
                    onClick={() => {
                      localStorage.setItem('nyayakasha_is_logged_in', 'true');
                      localStorage.setItem('nyayakasha_current_page', 'dashboard');
                      onNavigate('dashboard');
                    }}
                    className="w-full py-4 text-sm font-semibold text-black/40 hover:text-black transition-colors mt-2"
                  >
                    Skip
                  </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
