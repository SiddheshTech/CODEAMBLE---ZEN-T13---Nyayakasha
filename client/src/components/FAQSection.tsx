const FAQS = [
  {
    question: "How does Nyayakasha protect data against future supercomputers?",
    answer: "We use advanced 'Post-Quantum Cryptography'. This means our security is built using complex math that even future supercomputers will not be able to crack. Your evidence and records are locked down safely for decades to come."
  },
  {
    question: "Where is the data stored, and who actually owns it?",
    answer: "Your data never leaves your control. Nyayakasha is designed for strict data sovereignty, meaning all evidence and records are stored on government-approved, local servers. We only store the 'digital fingerprint' of the data on the secure network, never the private files themselves."
  },
  {
    question: "Do we need to replace our current court and police software?",
    answer: "No. Nyayakasha is built to work alongside your existing systems like CCTNS or eCourts. It acts as an invisible security layer running in the background, requiring zero changes to how your officers and judges currently work."
  },
  {
    question: "How are witness identities kept safe on a secure ledger?",
    answer: "We use a technology called 'Zero-Knowledge Proofs'. It allows a witness to prove they are telling the truth without ever revealing who they are. Their identity remains completely hidden using math until a judge legally authorizes it to be shown."
  },
  {
    question: "Is this built on a public cryptocurrency network like Bitcoin?",
    answer: "Absolutely not. Nyayakasha is a private, government-grade network. There are no cryptocurrencies or public tokens involved. The network is strictly controlled and verified only by authorized judges, legal professionals, and official departments."
  }
];

export function FAQSection() {
  return (
    <section className="bg-white px-4 md:px-6 py-16 md:py-24 border-t border-black/5">
      <div className="max-w-[88rem] mx-auto">
        <div className="mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-medium leading-tight mb-4 text-black tracking-tight" style={{ letterSpacing: '-0.04em' }}>
            Common Questions
          </h2>
          <p className="text-black/60 text-lg max-w-xl leading-relaxed">
            Clear answers on how we secure the justice system without disrupting your existing workflows.
          </p>
        </div>

        <div className="flex flex-col border-b border-black/10">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-12 py-10 border-t border-black/10 items-start"
            >
              <div className="md:col-span-5 lg:col-span-4">
                <h3 className="text-xl md:text-2xl font-medium text-black leading-snug">{faq.question}</h3>
              </div>
              <div className="md:col-span-7 lg:col-span-8">
                <p className="text-black/70 text-lg md:text-xl leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
