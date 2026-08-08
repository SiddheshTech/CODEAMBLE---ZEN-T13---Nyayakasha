import { motion } from 'motion/react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export function DocumentHeroAnimation() {
  const documents = Array.from({ length: 6 });
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden origin-center scale-[0.6] sm:scale-75 lg:scale-100 opacity-40 md:opacity-100 z-10">
      <div aria-hidden="true" className="absolute w-px" style={{ left: '50vw', top: '10%', height: '80%', background: 'linear-gradient(transparent, rgba(18, 20, 28, 0.15) 14%, rgba(18, 20, 28, 0.15) 86%, transparent)', zIndex: 15 }}></div>

      <div className="absolute flex items-center justify-center rounded-full border border-black/10 bg-white" style={{ left: '50vw', width: '70px', height: '70px', boxShadow: 'rgba(11, 14, 48, 0.15) 0px 14px 32px -8px', zIndex: 20, transform: 'translateX(-50%) translateY(-50%)', top: '50%' }}>
         <ShieldAlert className="w-8 h-8 text-black hidden" />
         <CheckCircle2 className="w-8 h-8 text-blue-600" />
      </div>

      {documents.map((_, i) => (
        <motion.div 
          key={i}
          className="absolute left-0 top-1/2"
          style={{ zIndex: 10 }}
          initial={{ x: '-10vw', y: (Math.random() - 0.5) * 150, rotate: (Math.random() - 0.5) * 20, opacity: 0 }}
          animate={{ 
            x: ['-10vw', '50vw', '110vw'],
            y: [(Math.random() - 0.5) * 150, 0, (Math.random() - 0.5) * 150],
            rotate: [(Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "linear",
            times: [0, 0.5, 0.9, 1]
          }}
        >
          <div className="relative" style={{ marginLeft: '-58px', marginTop: '-74px', width: '116px', height: '148px', borderRadius: '8px', boxShadow: 'rgba(11, 14, 48, 0.12) 0px 18px 34px -12px', background: 'white' }}>
            <svg width="116" height="148" viewBox="0 0 84 108" fill="none" aria-hidden="true"><path d="M8 4 H54 L76 26 V99 Q76 104 71 104 H13 Q8 104 8 99 Z" fill="#ffffff" stroke="#d3d4d8" strokeWidth="1.5" strokeLinejoin="round"></path><path d="M54 4 V21 Q54 26 59 26 H76" fill="none" stroke="#d3d4d8" strokeWidth="1.5" strokeLinejoin="round"></path><line x1="16" y1="26" x2="66" y2="26" stroke="#c2c3c8" strokeWidth="2.6" strokeLinecap="round"></line><line x1="16" y1="34" x2="56" y2="34" stroke="#c2c3c8" strokeWidth="2.6" strokeLinecap="round"></line><line x1="16" y1="42" x2="70" y2="42" stroke="#c2c3c8" strokeWidth="2.6" strokeLinecap="round"></line><line x1="16" y1="50" x2="62" y2="50" stroke="#c2c3c8" strokeWidth="2.6" strokeLinecap="round"></line><line x1="16" y1="58" x2="68" y2="58" stroke="#c2c3c8" strokeWidth="2.6" strokeLinecap="round"></line><line x1="16" y1="66" x2="54" y2="66" stroke="#c2c3c8" strokeWidth="2.6" strokeLinecap="round"></line><line x1="16" y1="74" x2="64" y2="74" stroke="#c2c3c8" strokeWidth="2.6" strokeLinecap="round"></line></svg>
            
            <motion.div 
              className="absolute" style={{ left: '44px', top: '76px' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0, 1, 1], scale: [0, 0, 1, 1] }}
              transition={{ duration: 8, repeat: Infinity, delay: i * 1.5, times: [0, 0.45, 0.55, 1] }}
            >
              <svg width="28" height="28" viewBox="0 0 30 30" fill="none" aria-hidden="true"><circle cx="15" cy="15" r="12" fill="#ffffff" stroke="#22c55e" strokeWidth="1.9"></circle><path d="M9.5 15.2 l3.7 3.7 L21 11.4" fill="none" stroke="#22c55e" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
