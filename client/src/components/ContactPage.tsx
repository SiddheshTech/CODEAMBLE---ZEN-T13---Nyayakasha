import { ArrowRight, Mail, MapPin, Key, ShieldCheck, Server, Lock, Cpu } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="flex-1 bg-[#F5F5F5]">
      {/* Hero Section */}
      <div className="pt-12 md:pt-20 pb-16 px-6">
        <div className="max-w-[88rem] mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 text-black/70 text-xs font-semibold tracking-widest uppercase mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Government Integration</span>
          </div>
          <h1 
            className="text-5xl md:text-7xl font-medium leading-none mb-6 text-black tracking-tight max-w-4xl"
            style={{ letterSpacing: '-0.04em' }}
          >
            Secure Your Systems
          </h1>
          <p className="text-black/70 text-lg md:text-xl leading-relaxed max-w-2xl">
            Partner with our security and technical teams to set up Nyayakasha across your state courts or police network. 
          </p>
        </div>
      </div>

      <div className="px-6 pb-24">
        <div className="max-w-[88rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column - Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="text-3xl font-medium mb-8 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Direct Contact
            </h2>
            
            <div className="flex flex-col gap-10">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div className="pt-1">
                  <p className="text-xs font-semibold tracking-widest uppercase text-black/50 mb-1">Official Inquiries</p>
                  <p className="text-lg font-medium text-black">deployments@nyayakasha.gov.in</p>
                  <p className="text-sm text-black/60 mt-1">We reply within 2 hours for state agencies.</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                  <Key className="w-6 h-6 text-black" />
                </div>
                <div className="pt-1">
                  <p className="text-xs font-semibold tracking-widest uppercase text-black/50 mb-1">Secure Chat</p>
                  <p className="text-lg font-medium text-black">PGP: 4F92 1A2B 98X4 7721</p>
                  <p className="text-sm text-black/60 mt-1">For sending highly secret technical details.</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div className="pt-1">
                  <p className="text-xs font-semibold tracking-widest uppercase text-black/50 mb-1">Head Office</p>
                  <p className="text-lg font-medium text-black leading-snug">
                    Nyayakasha Main Office
                  </p>
                  <p className="text-sm text-black/60 mt-1">Cyber Security Hub, Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Enterprise Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#2B2644] rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-medium mb-2 text-white tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  Request System Setup
                </h3>
                <p className="text-white/60 text-base mb-10 max-w-md">
                  Send us details about your current systems. All messages are fully secured and sent only to approved top-level staff.
                </p>
                
                <form className="flex flex-col gap-7" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-semibold tracking-wider uppercase text-white/70">Officer Name</label>
                      <input 
                        type="text" 
                        className="bg-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/30 outline-none focus:bg-white/10 transition-colors border border-white/10 focus:border-white/20"
                        placeholder="Full Name / Rank"
                      />
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-semibold tracking-wider uppercase text-white/70">State / Department</label>
                      <input 
                        type="text" 
                        className="bg-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/30 outline-none focus:bg-white/10 transition-colors border border-white/10 focus:border-white/20"
                        placeholder="e.g. State Police, High Court"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-semibold tracking-wider uppercase text-white/70">Official Email (.gov / .nic)</label>
                      <input 
                        type="email" 
                        className="bg-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/30 outline-none focus:bg-white/10 transition-colors border border-white/10 focus:border-white/20"
                        placeholder="name@organization.gov.in"
                      />
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-semibold tracking-wider uppercase text-white/70">Size of Setup</label>
                      <select defaultValue="" className="bg-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:bg-white/10 transition-colors border border-white/10 focus:border-white/20 appearance-none">
                        <option value="" disabled className="text-black">Select size...</option>
                        <option value="pilot" className="text-black">Small Test (1-50 Users)</option>
                        <option value="district" className="text-black">District Level (50-500 Users)</option>
                        <option value="state" className="text-black">State-Wide (500+ Users)</option>
                        <option value="federal" className="text-black">National Level</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-semibold tracking-wider uppercase text-white/70">Current Systems Used</label>
                    <textarea 
                      rows={4}
                      className="bg-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/30 outline-none focus:bg-white/10 transition-colors resize-none border border-white/10 focus:border-white/20"
                      placeholder="Briefly describe your current databases (like eCourts, CCTNS) and the main problems you face..."
                    ></textarea>
                  </div>

                  <div className="pt-2">
                    <button className="group inline-flex items-center justify-center gap-3 bg-white text-black text-lg font-medium px-8 py-4 rounded-2xl hover:bg-white/90 transition-all duration-200 w-full shadow-xl">
                      Submit Request Securely
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Timeline / Integration Process */}
      <div className="bg-white py-24 px-6 border-t border-black/5">
        <div className="max-w-[88rem] mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl font-medium tracking-tight mb-4 text-black" style={{ letterSpacing: '-0.02em' }}>
              Smooth and Easy Setup
            </h2>
            <p className="text-black/60 text-lg">
              Adding top security to old state systems should not take years. Our step-by-step plan ensures your daily work continues without stopping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#F5F5F5] border border-black/5">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Server className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-black">Step 1: Running in Background</h3>
              <p className="text-black/70 text-base leading-relaxed">
                Nyayakasha runs together with your current databases (like CCTNS or eCourts). It secures records silently without stopping your daily work or needing any new training.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-[#F5F5F5] border border-black/5">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-black">Step 2: Mobile Security</h3>
              <p className="text-black/70 text-base leading-relaxed">
                Secure apps are turned on for official mobile phones. Evidence gets locked exactly when it is collected using the PRAMANA layer, instantly saving the truth in the safe record.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#F5F5F5] border border-black/5">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-black">Step 3: AI Checks</h3>
              <p className="text-black/70 text-base leading-relaxed">
                MAYA-BREAK AI checks are turned on for judges. Any fake or changed evidence is caught automatically before court hearings, completing the total security circle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
