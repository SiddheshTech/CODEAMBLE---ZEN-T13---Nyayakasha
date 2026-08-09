import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { api } from '../services/api';

export function HigherAuthorityAuthPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminLogin(password);
      localStorage.setItem('nyayakasha_higher_authority_logged_in', 'true');
      onNavigate('higher-authority');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-[100] flex flex-col items-start gap-2">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <LogoIcon className="w-8 h-8 group-hover:scale-105 transition-all duration-500 text-black" />
          <span className="text-2xl font-bold tracking-tight transition-colors duration-500 text-black">
            Nyayakasha
          </span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-xl border border-black/5">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-black mb-2">Higher Authority Portal</h2>
        <p className="text-center text-black/60 mb-8 text-sm">Secure terminal for system administrators and oversight bodies.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-black/80 block mb-2">Admin Passkey</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 group-focus-within:text-black transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter root passkey"
                className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-black/20 focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-semibold mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white rounded-xl py-4 text-base font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/10"
          >
            Authenticate
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
