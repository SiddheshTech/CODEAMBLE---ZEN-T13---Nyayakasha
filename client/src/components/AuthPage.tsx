import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Mail, Lock, KeyRound, CheckCircle2, Eye, EyeOff, ShieldCheck, Grip, MonitorSmartphone, Fingerprint, AlertTriangle, Building2, UserCheck, Key, Shield } from 'lucide-react';

import { LogoIcon } from './LogoIcon';
import { api } from '../services/api';

type AuthState = 'login' | 'forgot' | 'new_device' | 'mfa' | 'pin';
type UserRole = 'Court Authority' | 'Field Submitter' | 'Independent Validator';

export function AuthPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Independent Validator');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pin, setPin] = useState('');
  const [simulateNewDevice, setSimulateNewDevice] = useState(true);
  const [isBiometricUser, setIsBiometricUser] = useState(false);
  const [webAuthnStatus, setWebAuthnStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const [judgeOptedInPin, setJudgeOptedInPin] = useState(false);
  const [courtBiometricStatus, setCourtBiometricStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  // Real API Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync role to localStorage so Dashboard opens with the right role
  useEffect(() => {
    localStorage.setItem('nyayakasha_user_role', selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    if (authState === 'mfa' && isBiometricUser && selectedRole !== 'Independent Validator') {
       // Simulate native OS prompt without extra screen
       const confirmed = window.confirm("NATIVE OS PROMPT SIMULATION: Verify fingerprint to continue");
       if (confirmed) {
         setAuthState('pin');
       } else {
         setAuthState('login'); // go back if failed
       }
    }
  }, [authState, isBiometricUser, selectedRole]);

  // Handle forgot password submission
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setAuthState('login');
      setIsSubmitted(false);
    }, 3000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const targetEmail = email.trim().toLowerCase();
      // Connect to real Express backend endpoint: POST /api/auth/signin
      const response = await api.signin(targetEmail, password);
      console.log('Real Signin API Response:', response);

      // Trigger Real Gmail SMTP OTP dispatch
      api.sendEmailOtp(targetEmail).catch(err => console.log('OTP send info:', err.message));

      if (simulateNewDevice) {
        setAuthState('new_device');
      } else {
        setAuthState('mfa');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourtBiometricAuthenticate = () => {
    setCourtBiometricStatus('scanning');
    setTimeout(() => {
      setCourtBiometricStatus('success');
      setTimeout(() => {
        setAuthState('pin');
      }, 1000);
    }, 1600);
  };

  const handleMfaChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newCode = [...mfaCode];
    newCode[index] = value.slice(-1);
    setMfaCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newCode.every(d => d !== '')) {
       const fullCode = newCode.join('');
       api.verifyEmailOtp(email.trim().toLowerCase(), fullCode)
         .then(() => {
           if (selectedRole === 'Independent Validator') {
             onNavigate('dashboard');
           } else {
             setAuthState('pin');
           }
         })
         .catch((err) => {
           setErrorMsg(err.message || 'Invalid 2FA verification code.');
         });
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleMfaPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newCode = [...mfaCode];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setMfaCode(newCode);
      if (pastedData.length === 6) {
        inputRefs.current[5]?.focus();
        if (selectedRole === 'Independent Validator') {
          setTimeout(() => onNavigate('dashboard'), 500);
        } else {
          setTimeout(() => setAuthState('pin'), 500);
        }
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  const handleWebAuthnAuthenticate = () => {
    setWebAuthnStatus('scanning');
    setTimeout(() => {
      setWebAuthnStatus('success');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1000);
    }, 1800);
  };

  const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    if (val.length === 4) {
      setErrorMsg(null);
      setIsLoading(true);
      try {
        // Connect to real backend API: POST /api/auth/verify-duress-pin
        const response = await api.verifyDuressPin(val, {
          lat: 19.0760,
          lng: 72.8777,
          jurisdictionCode: 'MH-MUM-DIST-01'
        });
        console.log('Real Duress/PIN Verification Response:', response);
        setTimeout(() => onNavigate('dashboard'), 500);
      } catch (err: any) {
        setErrorMsg(err.message || 'PIN authorization failed.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen md:h-screen bg-[#F5F5F5] flex flex-col md:flex-row items-center justify-center font-sans overflow-x-hidden">
      
      {/* Top Left Logo to go back */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-[100] flex flex-col items-start gap-2">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <LogoIcon className="w-8 h-8 group-hover:scale-105 transition-all duration-500 text-black max-md:text-black" />
          <span className=" text-2xl font-bold tracking-tight transition-colors duration-500 text-black max-md:text-black">
            Nyayakasha
          </span>
        </button>
        <button 
          onClick={() => onNavigate('home')}
          className="mt-2 text-sm font-medium opacity-60 hover:opacity-100 flex items-center gap-1 transition-colors text-black max-md:text-black cursor-pointer"
        >
          &larr; Back to Website
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full h-full flex items-center justify-center px-6 py-28 relative z-10 mx-auto">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden p-6 sm:p-8 border border-black/5 w-full max-w-lg mx-auto">
          
          <AnimatePresence mode="wait">
            {authState === 'login' && (
              <motion.div 
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col text-left"
              >
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Welcome Back
                  </h2>
                  <p className="text-black/60 text-sm">
                    Log in to safely access evidence, case dockets, and consensus controls.
                  </p>
                </div>

                {/* Role Switcher Tabs */}
                <div className="mb-6 bg-[#F5F5F5] p-1.5 rounded-2xl border border-black/5 space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-black/40 px-3 pt-1">
                    Select Sign-In Role Context:
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('Court Authority')}
                      className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        selectedRole === 'Court Authority'
                          ? 'bg-white text-black shadow-xs border border-black/5'
                          : 'text-black/60 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      Court Authority
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('Field Submitter')}
                      className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        selectedRole === 'Field Submitter'
                          ? 'bg-white text-black shadow-xs border border-black/5'
                          : 'text-black/60 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      Field Submitter
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('Independent Validator')}
                      className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        selectedRole === 'Independent Validator'
                          ? 'bg-white text-black shadow-xs border border-black/5'
                          : 'text-black/60 hover:text-black hover:bg-black/5'
                      }`}
                    >
                      Independent Validator
                    </button>
                  </div>
                </div>

                {/* Selected Role Badge / Info */}
                <div className="mb-6 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="text-amber-900 block font-bold mb-0.5">
                      Role: {selectedRole}
                    </strong>
                    {selectedRole === 'Independent Validator' && (
                      <span>Decryption Key Share Holder &amp; Consensus Voting Panel. Hardware WebAuthn key required.</span>
                    )}
                    {selectedRole === 'Court Authority' && (
                      <span>Judicial Bench &amp; Case File Review Authority. High-trust court environment.</span>
                    )}
                    {selectedRole === 'Field Submitter' && (
                      <span>Law Enforcement &amp; Evidence Officer. Geofenced mobile submission capabilities.</span>
                    )}
                  </div>
                </div>
                
                {errorMsg && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form className="flex flex-col gap-4 w-full" onSubmit={handleLoginSubmit}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/70">Official Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black/40 group-focus-within:text-black">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email ID" 
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border border-black/5 rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-sm font-medium text-black"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/70">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black/40 group-focus-within:text-black">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password" 
                        className="w-full pl-10 pr-10 py-3 bg-[#F5F5F5] border border-black/5 rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-sm font-medium text-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-black/40 hover:text-black transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end mt-0.5">
                      <button 
                        type="button" 
                        onClick={() => setAuthState('forgot')}
                        className="text-xs font-semibold text-black/60 hover:text-black transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    disabled={isLoading}
                    className="w-full bg-black text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-all mt-2 flex items-center justify-center gap-2 group text-sm shadow-lg shadow-black/10 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Authenticating with Backend...' : `Sign In as ${selectedRole}`}
                    {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </button>
                  
                  <div className="flex flex-col items-center justify-center mt-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={simulateNewDevice}
                        onChange={(e) => setSimulateNewDevice(e.target.checked)}
                        className="w-4 h-4 rounded text-black border-black/20 focus:ring-black/20 accent-black cursor-pointer"
                      />
                      <span className="text-xs text-black/60 font-medium">Simulate unrecognized device / location check</span>
                    </label>
                  </div>
                </form>
              </motion.div>
            )}

            {authState === 'new_device' && (
              <motion.div 
                key="new_device"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col text-left"
              >
                <div className="mb-6 text-center">
                  <div className="w-14 h-14 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-xs">
                    <MonitorSmartphone className="w-7 h-7 text-amber-700" />
                  </div>
                  <h2 className="text-2xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Unrecognized Device Detected
                  </h2>
                  <p className="text-black/60 text-sm leading-relaxed">
                    We noticed a sign-in attempt from an unrecognized browser / IP location.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F9F9F9] border border-black/5 space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-black/50 font-medium">Device:</span>
                    <span className="font-bold text-black font-mono">Chrome / macOS (Arm64)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-black/50 font-medium">Location:</span>
                    <span className="font-bold text-black">New Delhi (Statewide Network)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-black/50 font-medium">Role Standing:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                      {selectedRole === 'Independent Validator' ? 'National / Statewide Bar Standing (No Geofence)' : 'Authorized Court Bench'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    type="button" 
                    onClick={() => setAuthState('mfa')}
                    className="w-full bg-black text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-all text-sm shadow-lg shadow-black/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Yes, verify with {selectedRole === 'Independent Validator' ? 'Hardware Key' : 'MFA'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      alert("Account temporarily locked. Security secretariat notified.");
                      setAuthState('login');
                    }}
                    className="w-full bg-transparent text-red-600 border border-red-200 rounded-xl py-3 font-semibold hover:bg-red-50 transition-all text-sm cursor-pointer"
                  >
                    This wasn't me — Emergency Lock
                  </button>
                </div>
              </motion.div>
            )}

            {authState === 'forgot' && (
              <motion.div 
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col text-left"
              >
                {isSubmitted ? (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-medium text-black mb-2">Reset Instructions Sent</h2>
                    <p className="text-black/60 text-sm mb-6 leading-relaxed">
                      We have sent a secure password reset link to your official email ID. Please check your inbox.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 text-center">
                      <div className="w-14 h-14 bg-[#F5F5F5] border border-black/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                        <KeyRound className="w-7 h-7 text-black/80" />
                      </div>
                      <h2 className="text-2xl font-medium text-black mb-2">Reset Password</h2>
                      <p className="text-black/60 text-sm">Enter your official registered email ID to receive reset instructions.</p>
                    </div>
                    
                    <form className="flex flex-col gap-4 w-full" onSubmit={handleForgotSubmit}>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-black/70">Official Email</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black/40 group-focus-within:text-black">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input 
                            type="email" 
                            required
                            placeholder="Enter your registered email ID" 
                            className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border border-black/5 rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-4 focus:ring-black/5 transition-all text-sm font-medium text-black"
                          />
                        </div>
                      </div>
                      
                      <button type="submit" className="w-full bg-black text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-all mt-2 flex items-center justify-center gap-2 group text-sm shadow-lg shadow-black/10 cursor-pointer">
                        Send Reset Link
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button 
                        type="button" 
                        onClick={() => setAuthState('login')}
                        className="w-full bg-transparent text-black border border-black/20 rounded-xl py-3 font-semibold hover:bg-black/5 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        Back to Log In
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            {/* SCREEN 2 — MFA CHALLENGE */}
            {authState === 'mfa' && (
              <motion.div 
                key="mfa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col text-left"
              >
                {selectedRole === 'Independent Validator' ? (
                  /* Independent Validator: Hardware-attested WebAuthn challenge ONLY (No alternate TOTP path) */
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-xs">
                        <Fingerprint className="w-8 h-8 text-amber-700" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-2 border border-amber-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                        <span>Hardware-Attested WebAuthn Required</span>
                      </div>
                      <h2 className="text-2xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                        Physical Security Key Challenge
                      </h2>
                      <p className="text-black/60 text-sm leading-relaxed">
                        This role holds a threshold share of platform decryption keys. Tap your physical FIDO2 security key or platform authenticator.
                      </p>
                    </div>

                    {/* Intentional Friction Notice Banner */}
                    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed font-medium">
                        <strong className="text-amber-900 block mb-0.5">Strict Security Enforcement</strong>
                        No alternate authentication path (TOTP app or SMS) exists for Independent Validators. Physical security key attestation is mandatory to protect decryption key shares.
                      </p>
                    </div>

                    {/* Hardware Key Interaction Area */}
                    <div className="p-6 rounded-2xl border-2 border-dashed border-black/20 bg-[#F9F9F9] flex flex-col items-center justify-center text-center space-y-4">
                      {webAuthnStatus === 'idle' && (
                        <>
                          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-black">
                            <Key className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black mb-1">Insert or Touch YubiKey / Hardware Key</p>
                            <p className="text-xs text-black/50">Listening for FIDO2 CTAP2 hardware response...</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleWebAuthnAuthenticate}
                            className="w-full bg-black text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-all text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Fingerprint className="w-5 h-5" />
                            Touch Security Key to Attest
                          </button>
                        </>
                      )}

                      {webAuthnStatus === 'scanning' && (
                        <div className="py-4 flex flex-col items-center space-y-3">
                          <Fingerprint className="w-12 h-12 text-black animate-pulse" />
                          <p className="text-sm font-bold text-black">Verifying WebAuthn Hardware Attestation...</p>
                          <p className="text-xs text-black/50">Verifying ECDSA attestation signature against Bar Council registry</p>
                        </div>
                      )}

                      {webAuthnStatus === 'success' && (
                        <div className="py-4 flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold text-emerald-950">Hardware Attestation Verified!</p>
                          <p className="text-xs text-black/60">Bypassing PIN check • Entering Workspace...</p>
                        </div>
                      )}
                    </div>

                    <button 
                      type="button" 
                      onClick={() => {
                        setWebAuthnStatus('idle');
                        setAuthState('login');
                      }}
                      className="w-full bg-transparent text-black/60 hover:text-black border border-black/10 rounded-xl py-2.5 font-semibold transition-all text-xs cursor-pointer text-center"
                    >
                      &larr; Cancel &amp; Return to Sign In
                    </button>
                  </div>
                ) : selectedRole === 'Court Authority' ? (
                  /* Court Authority: Biometric / WebAuthn Challenge ONLY (No TOTP Fallback) */
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-xs">
                        <Fingerprint className="w-8 h-8 text-amber-700" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-2 border border-amber-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                        <span>Court Authority Biometric MFA</span>
                      </div>
                      <h2 className="text-2xl font-medium text-black mb-2" style={{ letterSpacing: '-0.02em' }}>
                        Biometric Passkey Challenge
                      </h2>
                      <p className="text-black/60 text-sm leading-relaxed">
                        Verify identity via platform biometrics or hardware passkey.
                      </p>
                    </div>

                    {/* Microcopy Banner */}
                    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed font-medium">
                        <strong className="text-amber-900 block mb-0.5">Mandatory Biometric Authentication</strong>
                        Only the biometric/WebAuthn prompt appears — there is no code-entry screen to fall back to, since no TOTP option was set up for Court Authority.
                      </p>
                    </div>

                    {/* Biometric Interaction Area */}
                    <div className="p-6 rounded-2xl border-2 border-dashed border-black/20 bg-[#F9F9F9] flex flex-col items-center justify-center text-center space-y-4">
                      {courtBiometricStatus === 'idle' && (
                        <>
                          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-black">
                            <Fingerprint className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black mb-1">Verify Touch ID / Face ID / Passkey</p>
                            <p className="text-xs text-black/50">Ready for platform biometric response...</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleCourtBiometricAuthenticate}
                            className="w-full bg-black text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-all text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Fingerprint className="w-5 h-5" />
                            Authenticate Biometrics
                          </button>
                        </>
                      )}

                      {courtBiometricStatus === 'scanning' && (
                        <div className="py-4 flex flex-col items-center space-y-3">
                          <Fingerprint className="w-12 h-12 text-black animate-pulse" />
                          <p className="text-sm font-bold text-black">Verifying Biometric Passkey Signature...</p>
                          <p className="text-xs text-black/50">Authenticating TPM judicial credential</p>
                        </div>
                      )}

                      {courtBiometricStatus === 'success' && (
                        <div className="py-4 flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold text-emerald-950">Biometrics Authenticated!</p>
                          <p className="text-xs text-black/60">
                            {judgeOptedInPin ? "Proceeding to Quick-Access PIN..." : "Skipping PIN check • Opening Court Workspace..."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Simulation Toggle for Judge Opted-In Duress PIN */}
                    <div className="p-3.5 rounded-xl bg-[#F5F5F5] border border-black/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-black/80 block">
                          Judge Opted into Duress PIN at Signup
                        </span>
                        <span className="text-[10px] text-black/50">
                          If checked, Screen 3 (PIN) will follow after biometric approval
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                        <input 
                          type="checkbox" 
                          checked={judgeOptedInPin}
                          onChange={(e) => setJudgeOptedInPin(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => {
                        setCourtBiometricStatus('idle');
                        setAuthState('login');
                      }}
                      className="w-full bg-transparent text-black/60 hover:text-black border border-black/10 rounded-xl py-2.5 font-semibold transition-all text-xs cursor-pointer text-center"
                    >
                      &larr; Cancel &amp; Return to Sign In
                    </button>
                  </div>
                ) : (
                  /* Field Submitter: Standard TOTP Input */
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-[#F5F5F5] border border-black/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                        <ShieldCheck className="w-7 h-7 text-black/80" />
                      </div>
                      <h2 className="text-2xl font-medium text-black mb-2">Two-Factor Authentication</h2>
                      <p className="text-black/60 text-sm">Enter the 6-digit code from your authenticator app.</p>
                    </div>
                    
                    <div className="flex flex-col gap-6 w-full">
                      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleMfaPaste}>
                        {mfaCode.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleMfaChange(index, e.target.value)}
                            onKeyDown={(e) => handleMfaKeyDown(index, e)}
                            className="w-11 h-14 text-center text-xl font-mono bg-[#F5F5F5] border border-black/10 rounded-xl focus:outline-none focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 transition-all text-black"
                          />
                        ))}
                      </div>

                      <button 
                        type="button" 
                        onClick={() => setAuthState('login')}
                        className="w-full bg-transparent text-black border border-black/20 rounded-xl py-3 font-semibold hover:bg-black/5 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        Back to Log In
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SCREEN 3 — PIN CONFIRMATION (Bypassed entirely for Independent Validator) */}
            {authState === 'pin' && selectedRole !== 'Independent Validator' && (
              <motion.div 
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col text-left"
              >
                <div className="mb-6 text-center">
                  <div className="w-14 h-14 bg-[#F5F5F5] border border-black/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Grip className="w-7 h-7 text-black/80" />
                  </div>
                  <h2 className="text-2xl font-medium text-black mb-2">Enter PIN</h2>
                  <p className="text-black/60 text-sm">Please enter your 4-digit PIN to unlock your session.</p>
                </div>
                
                <div className="flex flex-col gap-6 w-full items-center">
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={handlePinChange}
                    className="w-full max-w-[220px] px-4 py-4 bg-[#F5F5F5] border border-black/10 rounded-xl focus:outline-none focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 transition-all text-2xl tracking-[1em] font-mono text-center text-black shadow-inner"
                    autoFocus
                  />

                  <button 
                    type="button" 
                    onClick={() => setAuthState('login')}
                    className="w-full bg-transparent text-black border border-black/20 rounded-xl py-3 font-semibold hover:bg-black/5 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    Back to Log In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


