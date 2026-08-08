import { ArrowRight } from 'lucide-react';
import { BrandMarquee } from './BrandMarquee';

export function HeroSection({ onOpenWhitepaper }: { onOpenWhitepaper?: () => void }) {
  return (
    <section className="flex-1 px-4 md:px-6 pt-20 pb-6 flex items-end">
      <div 
        className="relative w-full max-w-[88rem] mx-auto rounded-2xl overflow-hidden min-h-[500px]"
        style={{ height: 'calc(100vh - 96px)' }}
      >
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="object-cover absolute inset-0 w-full h-full"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />

        <div className="relative z-10 flex flex-col items-start justify-end sm:justify-start h-full p-6 sm:p-12 pb-16 sm:pt-36">
          <h1 
            className="text-black text-4xl sm:text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4"
            style={{ letterSpacing: '-0.04em' }}
          >
            The Record<br />That Cannot Lie
          </h1>
          <p 
            className="text-black/80 text-base md:text-lg max-w-md mb-8 leading-relaxed font-medium sm:font-normal"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
          >
            A secure digital system for justice. It makes it impossible to fake, force, or change evidence, witness statements, or court decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 w-full sm:w-auto">
            <button className="flex justify-between sm:inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
              Join us
              <div className="bg-white rounded-full p-2">
                <ArrowRight className="w-5 h-5 text-black" />
              </div>
            </button>
            <button 
              onClick={onOpenWhitepaper}
              className="inline-flex justify-center items-center gap-3 bg-white/20 backdrop-blur-md border border-white/30 text-black hover:text-white text-base md:text-lg font-medium px-8 py-3 rounded-full hover:bg-black/50 transition-colors duration-200"
            >
              Technical Whitepaper
            </button>
          </div>
          
          <div className="hidden sm:block">
            <BrandMarquee />
          </div>
        </div>
      </div>
    </section>
  );
}
