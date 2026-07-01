import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "react-router-dom"

export default function WatchAnywhere() {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50])
  const y3 = useTransform(scrollYProgress, [0, 1], [150, -150])

  return (
    <section
      ref={containerRef}
      className="py-32 bg-[#050505] overflow-hidden relative border-t border-white/5"
    >
      <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 z-20">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Watch <br />
            Anywhere.
          </h2>
          <p className="text-xl text-neutral-400 mb-8 max-w-lg leading-relaxed">
            Stream unlimited anime on your phone, tablet, laptop, and TV without
            paying more. Sync your progress across all devices instantly.
          </p>
          <div className="flex gap-4">
            <Link to="/home">
              <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                Get Started
              </button>
            </Link>
          </div>
        </div>

        <div className="flex-1 relative h-[600px] w-full flex items-center justify-center">
          {/* Decorative glowing orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/20 rounded-full blur-[100px]" />

          {/* Laptop Mockup */}
          <motion.div
            style={{ y: y1 }}
            className="absolute z-10 -left-10 md:left-0 top-10"
          >
            <div className="w-[300px] md:w-[450px] aspect-video bg-[#111] rounded-2xl border-4 border-[#222] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
              <img
                src="https://media1.tenor.com/m/bm-59zifr-oAAAAd/reze-chainsaw-man-reze.gif"
                alt="Laptop View"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 w-full h-1 bg-[#222]"></div>
            </div>
          </motion.div>

          {/* Tablet Mockup */}
          <motion.div
            style={{ y: y2 }}
            className="absolute z-20 right-0 md:-right-10 top-1/2 -translate-y-1/2"
          >
            <div className="w-[200px] md:w-[280px] aspect-[3/4] bg-[#111] rounded-3xl border-8 border-[#222] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden">
              <img
                src="https://media1.tenor.com/images/a9c85354bc73c114b4cc75455abe4dc3/tenor.gif?itemid=19915426"
                alt="Tablet View"
                className="w-full h-full object-cover"
                />
            </div>
          </motion.div>

          {/* Phone Mockup */}
          <motion.div
            style={{ y: y3 }}
            className="absolute z-30 left-1/4 bottom-10"
            >
            <div className="w-[120px] md:w-[160px] aspect-[9/19] bg-[#111] rounded-[2rem] border-8 border-[#222] shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden">
              <img
            src="https://64.media.tumblr.com/7e2453da9674bcb5b18a2b60795dfa07/6ffe034dc5a009bc-9b/s540x810/8eac80d1085f4d86de5c884ab107e79c6f16fc8c.gif"
                alt="Phone View"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
