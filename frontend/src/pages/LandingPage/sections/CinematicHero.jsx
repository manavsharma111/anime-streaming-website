import React, { useRef, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "react-router-dom"
import { Play, Compass, Info } from "lucide-react"
import gsap from "gsap"

export default function CinematicHero() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4])

  useEffect(() => {
    // Parallax floating for background elements
    const ctx = gsap.context(() => {
      gsap.to(".floating-element", {
        y: -20,
        x: 10,
        rotation: 2,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: {
          each: 1,
          from: "random",
        },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[800px] flex items-center overflow-hidden bg-[#050505]"
    >
      {/* Background Image Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full z-0"
      >
        <div className="absolute inset-0 bg-[#050505]/40 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/30 to-transparent z-10"></div>

        {/* Collage/Background (Your Name official art for cinematic feel) */}
        <img
          src="https://images.wallpapersden.com/image/download/jujutsu-kaisen-satoru-gojo-hd_bWtpZ26UmZqaraWkpJRobWllrWdma2U.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover scale-[1.15] filter brightness-75"
        />

        {/* Subtle noise and particles could go here */}
      </motion.div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 md:px-12 mt-20">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-[100px] font-black text-white leading-[0.9] tracking-tighter mb-8"
          >
            Stream Anime <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">
              Without Limits.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-neutral-400 max-w-2xl mb-12 font-medium leading-relaxed"
          >
            Watch thousands of episodes in multiple languages and resolutions
            with a beautiful, cinematic streaming experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link to="/home">
              <button className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
                <span className="relative z-10">Start Watching</span>
                <Play size={20} className="relative z-10 fill-black" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-400 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </Link>
            <Link to="/search">
              <button className="group px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full backdrop-blur-md flex items-center gap-3 transition-all hover:border-white/30">
                <Info
                  size={20}
                  className="text-neutral-400 group-hover:text-white transition-colors"
                />
                Explore Catalog
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Statistics Glass Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="absolute bottom-12 right-12 z-20 hidden lg:flex gap-6"
      >
        <div className="floating-element bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-48 shadow-2xl">
          <div className="text-3xl font-black text-white mb-1">15K+</div>
          <div className="text-sm text-neutral-400 font-medium">Episodes</div>
        </div>
        <div
          className="floating-element bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-48 shadow-2xl"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-1">
            4K
          </div>
          <div className="text-sm text-neutral-400 font-medium">
            UHD Streaming
          </div>
        </div>
        <div
          className="floating-element bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-48 shadow-2xl"
          style={{ animationDelay: "1s" }}
        >
          <div className="text-3xl font-black text-white mb-1">2,500+</div>
          <div className="text-sm text-neutral-400 font-medium">
            Anime Titles
          </div>
        </div>
      </motion.div>
    </section>
  )
}
