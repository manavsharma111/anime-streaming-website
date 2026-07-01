import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function TextMaskPhilosophy() {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Smooth, snappy scaling
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 200]);
  
  // The mask fades out precisely at the end, ensuring no lingering black screens
  const maskOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  // A slight parallax on the background image itself for depth
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <section ref={containerRef} className="relative w-full h-[200vh] bg-[#050505]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Dynamic Authentic Anime Visual */}
        <motion.div style={{ scale: bgScale }} className="absolute inset-0 w-full h-full z-0">
          <img
            src="https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2560&auto=format&fit=crop"
            alt="Anime Aesthetic"
            className="w-full h-full object-cover brightness-75"
          />
          {/* Subtle gradient so the bottom seamlessly matches the next section */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
        </motion.div>

        {/* The Text Mask Layer */}
        {/* Using a single word ANIMESTREAM ensures the exact center is a solid letter (S), naturally fixing the 'space gap' bug */}
        <motion.div
          style={{ opacity: maskOpacity }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black mix-blend-multiply text-white pointer-events-none"
        >
          <motion.h1
            style={{ 
              scale,
              transformOrigin: "center center"
            }}
            className="text-[14vw] font-black tracking-tighter leading-none whitespace-nowrap"
          >
            ANIMESTREAM
          </motion.h1>
        </motion.div>
      </div>
    </section>
  )
}
