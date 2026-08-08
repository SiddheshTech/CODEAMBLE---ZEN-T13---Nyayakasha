import { Cpu, FileSearch, EyeOff, BarChart3, Scale, BrainCircuit, Lock } from 'lucide-react';

const LAYERS = [
  {
    title: "PRAMANA: Secure Evidence",
    subtitle: "Evidence Collection",
    description: "Every piece of evidence is locked the moment it is collected. Using official apps on normal mobile phones, PRAMANA creates an unbreakable digital seal. The second a photo is taken or document scanned, the system saves a unique digital code, GPS location, exact time, and the officer's fingerprint directly to a secure network. This stops any changes between the crime scene and the court.",
    icon: Cpu,
    colSpan: "lg:col-span-2",
    bg: "bg-white"
  },
  {
    title: "MAYA-BREAK: Fake Detection",
    subtitle: "Deepfake & Forgery Detection",
    description: "An advanced AI system made to find hidden signs of forgery. It automatically checks every submitted document or photo against its original secure record. By detecting deepfakes and hidden file data, it catches changes and stops fake evidence before it reaches a judge.",
    icon: FileSearch,
    colSpan: "lg:col-span-1",
    bg: "bg-[#2B2644]",
    text: "text-white"
  },
  {
    title: "Safe Witness Statements",
    subtitle: "Witness Protection",
    description: "Protecting those who speak the truth. Witnesses give their statements using advanced security, allowing them to prove facts without showing their identity to the public. Their identity stays completely hidden using math until the court legally allows it to be shown, making it impossible to threaten them.",
    icon: EyeOff,
    colSpan: "lg:col-span-1",
    bg: "bg-[#2B2644]",
    text: "text-white"
  },
  {
    title: "Secure Corruption Check",
    subtitle: "Corruption Detection",
    description: "Finding widespread corruption without risking privacy. This part uses secure computing to let AI study patterns in court decisions. The system works directly on locked data—finding unfairness while making sure no citizen's private information is ever opened or seen.",
    icon: BarChart3,
    colSpan: "lg:col-span-2",
    bg: "bg-white"
  },
  {
    title: "DHARMA Verification",
    subtitle: "Court-Native Verification",
    description: "A verification system built just for courts. Instead of standard checks, DHARMA uses a special weighted system. Judges, lawyers, and citizen groups each have different levels of power to confirm that no record has been secretly changed.",
    icon: Scale,
    colSpan: "lg:col-span-2",
    bg: "bg-white"
  },
  {
    title: "Smart Judgment Check",
    subtitle: "Judgment Simulation",
    description: "An AI system trained on past court cases. It guesses how different courts might decide based on the facts. If a new court decision is very different from what is expected, the system automatically alerts higher officials to review it.",
    icon: BrainCircuit,
    colSpan: "lg:col-span-1",
    bg: "bg-[#2B2644]",
    text: "text-white"
  }
];

export function LayersSection() {
  return (
    <section className="bg-[#F5F5F5] px-4 md:px-6 py-16 md:py-24 border-t border-black/5">
      <div className="max-w-[88rem] mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-medium leading-tight mb-4 text-black tracking-tight" style={{ letterSpacing: '-0.04em' }}>
            The Architecture of Absolute Truth
          </h2>
          <p className="text-black/60 text-xl max-w-2xl">
            Six foundational layers designed to make evidence tampering, witness coercion, and biased judgments mathematically impossible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LAYERS.map((layer, idx) => (
            <div 
              key={idx} 
              className={`rounded-3xl p-8 flex flex-col justify-between min-h-[320px] ${layer.colSpan} ${layer.bg} ${layer.text || 'text-black'} shadow-sm`}
            >
              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${layer.text ? 'bg-white/10' : 'bg-black/5'}`}>
                  <layer.icon className="w-6 h-6" />
                </div>
                <p className={`text-sm font-semibold tracking-wider uppercase mb-2 ${layer.text ? 'text-white/60' : 'text-black/50'}`}>
                  {layer.subtitle}
                </p>
                <h3 className="text-2xl font-medium mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  {layer.title}
                </h3>
              </div>
              <p className={`text-base leading-relaxed ${layer.text ? 'text-white/80' : 'text-black/70'}`}>
                {layer.description}
              </p>
            </div>
          ))}
          
          <div className="lg:col-span-3 rounded-3xl p-8 bg-gradient-to-r from-[#1A1A1A] to-[#000000] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xl mt-2">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase text-white/60 mb-1">Bonus Architecture</p>
                <h3 className="text-2xl font-medium tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  Future-Proof Security Layer
                </h3>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed max-w-2xl md:text-right">
              Nyayakasha is ready for the future. We use advanced security methods that even supercomputers cannot break. This guarantees that the evidence records remain unbreakable and your data stays safe, even against the most powerful computer attacks decades from now.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
