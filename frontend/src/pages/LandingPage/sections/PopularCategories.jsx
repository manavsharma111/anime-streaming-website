import React from "react"
import { motion } from "framer-motion"

const categories = [
  "ACTION",
  "FANTASY",
  "ROMANCE",
  "COMEDY",
  "SCI-FI",
  "SPORTS",
  "SLICE OF LIFE",
  "HORROR",
  "DRAMA",
  "MECHA",
]

export default function PopularCategories() {
  return (
    <section className="py-24 bg-[#050505] overflow-hidden relative border-t border-white/5 z-10">
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-20 pointer-events-none" />

      <div className="mb-12 px-6 text-center">
        <h2 className="text-xl md:text-2xl text-neutral-500 font-bold tracking-[0.3em] uppercase">
          Explore Universes
        </h2>
      </div>

      <div className="flex flex-col gap-4 md:gap-8 transform -rotate-2 scale-105">
        {/* Row 1 - Left to Right */}
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            animate={{ x: [0, -1500] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            className="flex gap-8 items-center"
          >
            {[...categories, ...categories, ...categories].map((cat, i) => (
              <div key={i} className="group cursor-default">
                <h3
                  className="text-6xl md:text-9xl font-black text-transparent tracking-tighter hover:text-white transition-colors duration-300"
                  style={{ WebkitTextStroke: "1px rgba(255,255,255,0.15)" }}
                >
                  {cat}
                </h3>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            animate={{ x: [-1500, 0] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            className="flex gap-8 items-center"
          >
            {[...categories]
              .reverse()
              .concat([...categories].reverse(), [...categories].reverse())
              .map((cat, i) => (
                <div key={i} className="group cursor-default">
                  <h3
                    className="text-6xl md:text-9xl font-black text-transparent tracking-tighter hover:text-red-500 transition-colors duration-300"
                    style={{ WebkitTextStroke: "1px rgba(255,255,255,0.15)" }}
                  >
                    {cat}
                  </h3>
                </div>
              ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
