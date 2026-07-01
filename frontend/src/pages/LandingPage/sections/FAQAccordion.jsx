import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const faqs = [
  {
    q: "IS IT REALLY FREE?",
    a: "Yes. 100% free, forever. No hidden fees, no credit cards required.",
  },
  {
    q: "ARE THERE ADS?",
    a: "We run minimal, non-intrusive ads to keep the servers running and the anime free.",
  },
  {
    q: "DO YOU HAVE DUBS?",
    a: "Absolutely. You can switch between Japanese audio and English dubs instantly.",
  },
  {
    q: "HOW FAST ARE UPLOADS?",
    a: "Episodes are available within hours of their official Japanese broadcast.",
  },
  {
    q: "CAN I DOWNLOAD?",
    a: "Yes, you can download episodes in 1080p directly to your device for offline viewing.",
  },
]

export default function FAQAccordion() {
  const [active, setActive] = useState(null)

  return (
    <section className="py-32 md:py-48 bg-[#050505] relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl md:text-8xl font-black text-white mb-16 md:mb-24 tracking-tighter text-center md:text-left">
          THE Details.
        </h2>

        <div className="border-t border-white/10">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border-b border-white/10 group cursor-pointer"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
            >
              <div className="py-8 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 relative overflow-hidden">
                {/* Background hover reveal */}
                <div className="absolute inset-0 bg-white/[0.02] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out pointer-events-none" />

                <h3 className="text-2xl md:text-5xl font-black text-neutral-600 group-hover:text-white transition-colors duration-500 tracking-tighter relative z-10">
                  {faq.q}
                </h3>

                <AnimatePresence>
                  {active === i && (
                    <motion.div
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="md:max-w-md overflow-hidden relative z-10"
                    >
                      <p className="text-base md:text-lg text-neutral-300 font-medium pb-4 md:pb-0">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
