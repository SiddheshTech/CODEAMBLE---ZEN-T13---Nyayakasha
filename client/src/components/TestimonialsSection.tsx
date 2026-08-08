import { Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

const TESTIMONIALS = [
  {
    quote: "Nyayakasha represents the most significant leap in judicial infrastructure since the digitization of court records. The mathematical certainty it brings to evidence handling is unprecedented.",
    author: "Justice Vikram M. (Retd.)",
    title: "Former Chief Justice, High Court of Delhi"
  },
  {
    quote: "The zero-knowledge witness protocol fundamentally changes how we can protect vulnerable individuals. It removes the structural intimidation that has plagued our justice system for decades.",
    author: "Dr. Anjali Desai",
    title: "Senior Advocate, Supreme Court of India"
  },
  {
    quote: "By locking digital evidence at the exact moment of capture, Nyayakasha eliminates the 'grey area' where most tampering occurs. It builds an unbreakable chain of custody.",
    author: "Rajan K. Srivastava",
    title: "Former Director, Central Bureau of Investigation (CBI)"
  }
];

export function TestimonialsSection() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-white px-4 md:px-6 py-16 md:py-24 border-t border-black/5">
      <div className="max-w-[88rem] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium leading-tight mb-4 text-black tracking-tight" style={{ letterSpacing: '-0.04em' }}>
            Judicial Perspectives
          </h2>
          <p className="text-black/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Leading voices in the Indian legal system on how Nyayakasha is establishing a new standard for trust and mathematical certainty in courts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-[#2B2644] rounded-[2rem] p-8 md:p-10 flex flex-col relative overflow-hidden shadow-lg min-h-[320px]">
                <div className="w-10 h-10 bg-white/10 rounded-full mb-8 shrink-0 animate-pulse" />
                <div className="space-y-3 mb-10 flex-1">
                  <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-11/12 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-4/5 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                </div>
                <div className="mt-auto">
                  <div className="h-5 bg-white/10 rounded w-1/2 mb-2 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))
          ) : (
            TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-[#2B2644] rounded-[2rem] p-8 md:p-10 flex flex-col relative overflow-hidden group shadow-lg min-h-[320px]">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors duration-500"></div>
                
                <Quote className="w-10 h-10 text-white/20 mb-8 shrink-0 relative z-10" />
                
                <p className="text-white/90 text-lg leading-relaxed mb-10 flex-1 relative z-10">
                  "{testimonial.quote}"
                </p>
                
                <div className="mt-auto relative z-10">
                  <p className="text-white font-medium text-lg tracking-tight mb-1">{testimonial.author}</p>
                  <p className="text-white/60 text-sm leading-snug">{testimonial.title}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
