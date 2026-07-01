import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function CinematicTrailer() {
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Start small, scale up to full viewport
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.5, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])
  
  // Text fades in and slides up as the card reaches full scale
  const textY = useTransform(scrollYProgress, [0.4, 0.6], [50, 0])
  const textOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1])

  return (
    <section ref={containerRef} className="relative w-full h-[150vh] bg-[#050505] flex items-center justify-center">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-4 md:px-0">
        
        <motion.div 
          style={{ scale, opacity }} 
          className="relative w-full md:w-[85vw] h-[60vh] md:h-[85vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-black"
        >
          {/* Authentic High-Quality Anime Aesthetic */}
          <img 
            src="https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2560&auto=format&fit=crop" 
            alt="Trailer Background"
            className="w-full h-full object-cover brightness-[0.6] hover:brightness-75 transition-all duration-1000 scale-105"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
          
          <motion.div 
            style={{ y: textY, opacity: textOpacity }}
            className="absolute bottom-10 left-6 md:bottom-20 md:left-20 flex flex-col gap-4 pointer-events-none"
          >
            <h2 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tighter leading-[1.1]">
              EXPERIENCE <br/> THE ACTION
            </h2>
            <p className="text-white/60 text-lg md:text-2xl max-w-lg font-medium">
              Dive into the most stunning cinematic anime moments curated exclusively for you. No compromises.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
