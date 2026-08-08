import { motion } from 'motion/react';
import { DocumentHeroAnimation } from './DocumentHeroAnimation';

export function DocumentFlowSection() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden flex flex-col justify-center min-h-[60vh] border-b border-black/5">
      <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)] pointer-events-none"></div>
      
      <DocumentHeroAnimation />

      <div className="max-w-5xl mx-auto text-center flex flex-col items-center relative z-20 px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-sm border border-black/10 px-6 sm:px-8 py-8 sm:py-10 rounded-3xl shadow-xl max-w-2xl"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Automated Validation<br/>At Scale
          </h2>
          <p className="text-lg text-black/60 leading-relaxed font-medium">
            Millions of documents verified in real-time, eliminating backlog and ensuring flawless compliance across jurisdictions.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
