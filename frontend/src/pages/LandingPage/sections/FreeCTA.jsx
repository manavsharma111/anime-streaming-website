import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "react-router-dom"
import { Play } from "lucide-react"

export default function FreeCTA() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2])
  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section
      ref={containerRef}
      className="relative py-48 bg-[#050505] overflow-hidden border-t border-white/5 z-10 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/10 to-transparent pointer-events-none" />

      <motion.div
        style={{ scale, y }}
        className="container mx-auto px-6 relative z-10 text-center"
      >
        <h2 className="text-[15vw] md:text-[10vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-900 leading-none tracking-tighter mix-blend-overlay">
          100% FREE.
        </h2>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h2
            className="text-[15vw] md:text-[10vw] font-black text-transparent tracking-tighter leading-none"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}
          >
            100% FREE.
          </h2>
        </div>

        <div className="mt-8 md:mt-12 relative z-20">
          <p className="text-lg md:text-3xl text-neutral-400 max-w-3xl mx-auto mb-12 font-medium">
            No subscriptions. No credit cards. Just pure anime streaming.
          </p>

          <div className="flex justify-center z-20 relative">
            <Link to="/home">
              <button className="group relative px-8 py-5 md:px-12 md:py-6 bg-white text-black font-black text-xl md:text-2xl rounded-full overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-[0_0_60px_rgba(255,255,255,0.2)]">
                <span className="relative z-10 flex items-center gap-3">
                  Start Watching Free
                  <Play
                    size={24}
                    className="fill-black group-hover:translate-x-1 transition-transform"
                  />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                  Start Watching Free
                  <Play
                    size={24}
                    className="fill-white group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
