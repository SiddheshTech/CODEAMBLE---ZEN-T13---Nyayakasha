import { ArrowRight } from 'lucide-react';

export function UseCasesSection() {
  return (
    <section className="bg-[#F5F5F5] px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="md:pr-12 md:pt-2">
          <p className="text-black/60 text-sm mb-2 font-medium">Government & State Rollout</p>
          <h2 
            className="text-4xl sm:text-5xl md:text-6xl font-medium leading-none mb-6"
            style={{ letterSpacing: '-0.04em' }}
          >
            Easy to Use Everywhere
          </h2>
          <p className="text-black/60 text-base leading-relaxed max-w-sm">
            Nyayakasha is designed to easily connect with existing state courts, police departments, and national agencies. It works as a powerful security upgrade that runs quietly in the background, requiring no changes to how officers and judges currently work.
          </p>
        </div>
        
        <div className="relative rounded-3xl overflow-hidden min-h-[500px] md:min-h-[720px] flex flex-col justify-end p-6 sm:p-10 md:p-12">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="object-cover absolute inset-0 w-full h-full"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent md:hidden" />
          
          <div className="relative z-10">
            <h3 
              className="text-white md:text-black text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-5"
              style={{ letterSpacing: '-0.03em' }}
            >
              No New Devices Needed.<br />Just Total Security.
            </h3>
            <p className="text-white/90 md:text-black/70 text-base max-w-md mb-8 drop-shadow-md md:drop-shadow-none">
              Whether it is a police officer taking scene photos using a secure mobile app, or a judge reviewing documents online, everything is protected. Our software-only setup means there are no hard devices to install—just instant, easy-to-use security for the whole justice system.
            </p>
            
            <a href="#" className="inline-flex items-center gap-3 group text-white md:text-black font-medium transition-colors">
              <div className="w-9 h-9 rounded-full bg-black/50 md:bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-black/70 md:group-hover:bg-white transition-colors duration-200">
                <ArrowRight className="w-4 h-4 text-white md:text-black" />
              </div>
              Get Technical Details
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
