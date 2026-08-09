import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ShieldCheck, Check, ArrowRight, User } from 'lucide-react';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
}

export function DemoRequestModal({ isOpen, onClose, onApprove }: DemoRequestModalProps) {
  const [step, setStep] = useState<'request' | 'mock-email'>('request');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Field Submitter' | 'Court Authority' | 'Independent Validator'>('Field Submitter');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep('mock-email');
    }
  };

  const handleApprove = () => {
    onApprove();
    onClose();
    // Reset state after closing
    setTimeout(() => {
      setStep('request');
      setEmail('');
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto border border-black/10"
            >
              {/* Header */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    {step === 'request' ? <User className="w-5 h-5 text-black" /> : <Mail className="w-5 h-5 text-black" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black">
                      {step === 'request' ? 'Request Demo Access' : 'Higher Authority Inbox'}
                    </h3>
                    <p className="text-sm text-black/60">
                      {step === 'request' ? 'For field visitors & external testing' : 'Simulated Email View'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6 text-black/50" />
                </button>
              </div>

              <div className="p-6 md:p-8">
                {step === 'request' ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-black/80 block">Your Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="visitor@example.com"
                        className="w-full px-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-black/5 transition-all text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-black/80 block">Requested Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-black/5 transition-all text-base"
                      >
                        <option value="Field Submitter">Field Submitter</option>
                        <option value="Court Authority">Court Authority</option>
                        <option value="Independent Validator">Independent Validator</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-black text-white rounded-xl py-4 text-base font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      Request Invite Link
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-black/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="mb-4 space-y-1">
                        <p className="text-xs font-semibold text-black/50 uppercase tracking-wider">From: Nyayakasha System</p>
                        <p className="text-lg font-medium text-black">Action Required: New Access Request</p>
                      </div>
                      <div className="space-y-4 text-sm text-black/80 leading-relaxed bg-white p-4 rounded-xl border border-black/5">
                        <p>A new visitor is requesting access to the Nyayakasha forensic network.</p>
                        <div className="space-y-2 py-3 border-y border-black/5">
                          <p><span className="font-semibold text-black">Applicant Email:</span> {email}</p>
                          <p><span className="font-semibold text-black">Requested Role:</span> {role}</p>
                        </div>
                        <p>Please review and approve or decline this request to generate their unique sign-up invitation link.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        onClick={() => {
                          onClose();
                          setTimeout(() => { setStep('request'); setEmail(''); }, 500);
                        }}
                        className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-xl py-3.5 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Decline Access
                      </button>
                      <button
                        onClick={handleApprove}
                        className="flex-1 bg-emerald-500 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Approve & Share Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
