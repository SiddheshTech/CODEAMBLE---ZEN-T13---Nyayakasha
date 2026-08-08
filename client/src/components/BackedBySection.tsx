const BACKERS = [
  { name: 'Ministry of Law', style: { fontFamily: '"Times New Roman", Times, serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px' } },
  { name: 'SUPREME COURT', style: { fontFamily: '"Arial Black", Gadget, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px' } },
  { name: 'HIGH COURTS', style: { fontFamily: 'Impact, Charcoal, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px' } },
  { name: 'C-DAC', style: { fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px' } },
  { name: 'NITI Aayog', style: { fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px' } },
  { name: 'DSCI', style: { fontFamily: 'Verdana, Geneva, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase' as const } },
  { name: 'NIC', style: { fontFamily: '"Courier New", Courier, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px' } },
  { name: 'Blockchain Council', style: { fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px' } },
];

export function BackedBySection() {
  return (
    <section className="bg-[#F5F5F5] px-4 md:px-6 py-12 md:py-16">
      <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        <div className="md:col-span-1 text-black/70 text-base leading-relaxed whitespace-pre-line">
          Supported by legal institutions{"\n"}and technology innovators.
        </div>
        
        <div className="md:col-span-3 overflow-hidden w-full">
          <div className="backers-track">
            {[1, 2].map((group) => (
              <div key={group} className="flex items-center">
                {BACKERS.map((backer, i) => (
                  <div 
                    key={`${group}-${i}`} 
                    className="mx-10 shrink-0 text-black/50 whitespace-nowrap"
                    style={backer.style}
                  >
                    {backer.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
