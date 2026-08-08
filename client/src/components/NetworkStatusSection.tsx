import { useState, useEffect } from 'react';
import { Activity, Server, Shield, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const INITIAL_DATA = Array.from({ length: 40 }, (_, i) => ({
  time: i,
  activity: Math.floor(Math.random() * 50) + 120,
}));

export function NetworkStatusSection() {
  const [data, setData] = useState(INITIAL_DATA);
  const [nodes, setNodes] = useState(1243);
  const [blockHash, setBlockHash] = useState("0x00000000");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoading(false), 1500);

    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1), {
          time: prev[prev.length - 1].time + 1,
          activity: Math.floor(Math.random() * 50) + 120,
        }];
        return newData;
      });
      setNodes(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
      
      // Generate a random block hash piece
      const hashPart = Math.random().toString(16).substring(2, 10);
      setBlockHash(`0x${hashPart}...`);
    }, 1500);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="bg-[#0A0A0A] px-4 md:px-6 py-16 md:py-24 text-white relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[88rem] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <div className="lg:col-span-5 flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold tracking-widest uppercase mb-6 w-fit">
              <Activity className="w-4 h-4 text-green-400" />
              Live Network
            </div>
            
            <h2 className="text-4xl md:text-5xl font-medium leading-tight mb-6 tracking-tight text-white" style={{ letterSpacing: '-0.04em' }}>
              DHARMA Consensus Active
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-lg mb-10">
              Our decentralized post-quantum nodes are constantly verifying the integrity of the judicial ledger. The network operates autonomously to lock evidence timestamps mathematically.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">Decentralized Verifiers</p>
                  <p className="text-white/60 text-sm">Spread across sovereign state borders.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">Quantum-Resistant Layer</p>
                  <p className="text-white/60 text-sm">Protected by Kyber algorithm standards.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden shadow-2xl min-h-[400px]">
              {/* Internal glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>

              {isLoading ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-6 mb-8 relative z-10">
                    <div>
                      <div className="h-4 bg-white/10 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="h-10 bg-white/10 rounded w-32 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-white/10 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="h-10 bg-white/10 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="h-4 bg-white/10 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="h-10 bg-white/10 rounded w-32 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="h-48 md:h-64 w-full relative z-10 mt-auto bg-white/5 rounded-2xl animate-pulse"></div>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-6 mb-8 relative z-10">
                    <div>
                      <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-1">Active Nodes</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-medium text-white">{nodes}</span>
                        <span className="text-green-400 text-sm flex items-center gap-1 font-medium">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          Online
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-1">Network Health</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <span className="text-2xl font-medium text-white">Optimal</span>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-1">Latest Anchor</p>
                      <p className="text-white font-mono font-medium text-lg">{blockHash}</p>
                    </div>
                  </div>

                  <div className="h-48 md:h-64 w-full relative z-10 mt-auto animate-in fade-in duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <YAxis domain={['dataMin - 20', 'dataMax + 20']} hide />
                        <Area 
                          type="monotone" 
                          dataKey="activity" 
                          stroke="#ffffff" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorActivity)" 
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
