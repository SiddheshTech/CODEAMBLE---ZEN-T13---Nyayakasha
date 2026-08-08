import { ShieldCheck } from 'lucide-react';

export function ClaimsSection() {
  const claims = [
    {
      title: "Total Witness Protection",
      desc: "The world's first system that completely hides witness identities using advanced math, making threats impossible before the trial."
    },
    {
      title: "Secure Court Analytics",
      desc: "The first system to find unfairness and corruption in courts without ever looking at private case details."
    },
    {
      title: "Secure Evidence Collection",
      desc: "India's first system that locks digital evidence the exact second it is collected, using unbreakable digital seals with date and time."
    },
    {
      title: "Justice-Focused Verification",
      desc: "The first secure verification system built just for courts, giving power to judges, lawyers, and citizens to check the truth."
    }
  ];

  return (
    <section className="bg-[#0A0A0A] py-12 md:py-16 px-4 md:px-6 relative z-10">
      <div className="max-w-[88rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {claims.map((claim, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg font-medium tracking-tight mb-2">{claim.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{claim.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
