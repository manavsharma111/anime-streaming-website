import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// ── Data ──────────────────────────────────────────────────────────────
const roster = [
  {
    title: "Smoking Behind The Super Market",
    img: "https://www.otakupt.com/wp-content/uploads/2026/03/Smoking-Behind-the-Supermarket-with-You-anime-pv-animejapan-2026-screenshot-smoking.jpg",
    rating: 8.7,
    ep: 12,
    genre: "Romance",
    accent: "#f472b6",
    num: "01",
  },
  {
    title: "Bungou Stray Dogs",
    img: "https://wallpapercave.com/wp/wp6787215.jpg",
    rating: 8.9,
    ep: 26,
    genre: "Supernatural",
    accent: "#a78bfa",
    num: "02",
  },
  {
    title: "Your Name",
    img: "https://wallpaperaccess.com/full/2397732.png",
    rating: 8.9,
    ep: 1,
    genre: "Romance",
    accent: "#38bdf8",
    num: "03",
  },
  {
    title: "Jujutsu Kaisen",
    img: "https://comicbook.com/wp-content/uploads/sites/4/2025/05/Jujutsu-Kaisen-Shibuya-Incident.jpg?resize=2000,1125",
    rating: 8.7,
    ep: 24,
    genre: "Action",
    accent: "#fb923c",
    num: "04",
  },
  {
    title: "Chainsaw Man",
    img: "https://comicbook.com/wp-content/uploads/sites/4/2025/09/Chainsaw-Man-Reze-Arc-movie-release-date-us-anime.jpg?resize=425",
    rating: 8.2,
    ep: 12,
    genre: "Action",
    accent: "#f87171",
    num: "05",
  },
]

// Each anime gets this many vh of scroll distance (no snap — snap conflicted with Lenis)
const VH_PER_ITEM = 200

// ── Preload all images on mount ───────────────────────────────────────
function usePreload(srcs) {
  useEffect(() => {
    srcs.forEach((src) => {
      const i = new Image()
      i.src = src
    })
  }, [])
}

// ── Word-by-word title reveal ─────────────────────────────────────────
function WordReveal({ text, delay = 0, className = "" }) {
  return (
    <div className={"flex flex-wrap " + className}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className="overflow-hidden inline-block mr-[0.3em] last:mr-0"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "115%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.72,
              delay: delay + i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────
export default function HoverRoster({ animeList = [], loading }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const sectionRef = useRef(null)
  const posterRef = useRef(null)

  // 3D tilt + shine
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const spring = { stiffness: 110, damping: 22, mass: 0.9 }
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-9, 9]), spring)
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [7, -7]), spring)
  const shineX = useTransform(mouseX, [0, 1], [0, 100])
  const shineY = useTransform(mouseY, [0, 1], [0, 100])
  const shine = useMotionTemplate`radial-gradient(circle 300px at ${shineX}% ${shineY}%, rgba(255,255,255,0.06), transparent 65%)`

  usePreload(roster.map((r) => r.img))

  // ── GSAP pin, NO snap — snap conflicted with Lenis causing items to skip.
  // onUpdate reads Lenis-smoothed scroll (via lenis.on("scroll",ScrollTrigger.update)
  // already wired in SmoothScroll.jsx), so progress is always accurate.
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${roster.length * VH_PER_ITEM}vh`,
        pin: true,
        pinSpacing: true,
        onUpdate(self) {
          // Multiply by roster.length + 0.5 to give the last item extra pinned time
          // before the section unpins, ensuring the user actually sees it.
          const idx = Math.min(
            Math.floor(self.progress * (roster.length + 0.5)),
            roster.length - 1,
          )
          setActiveIdx((prev) => (prev !== idx ? idx : prev))
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!posterRef.current) return
      const r = posterRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - r.left) / r.width)
      mouseY.set((e.clientY - r.top) / r.height)
    },
    [mouseX, mouseY],
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }, [mouseX, mouseY])

  const cur = roster[activeIdx]

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100dvh] md:h-screen overflow-hidden bg-[#020202]"
      style={{ zIndex: 20 }}
    >
      {/* Blurred ambient background */}
      <AnimatePresence>
        <motion.div
          key={"bg-" + activeIdx}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4 }}
        >
          <img
            src={cur.img}
            alt=""
            aria-hidden
            className="w-full h-full object-cover scale-110 blur-xl md:blur-[90px] brightness-[0.2] md:brightness-[0.12] saturate-150 md:saturate-200"
            style={{
              willChange: "opacity",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Film grain */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage:
            'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")',
          opacity: 0.04,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Accent glow */}
      <AnimatePresence>
        <motion.div
          key={"glow-" + activeIdx}
          className="absolute inset-0 z-[1] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            background: `radial-gradient(ellipse 55% 65% at 55% 50%, ${cur.accent}14 0%, transparent 70%)`,
          }}
        />
      </AnimatePresence>

      {/* ── Layout ─────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col md:flex-row">
        {/* POSTER PANEL */}
        <div
          ref={posterRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full md:w-[58%] h-[52vh] md:h-full flex-shrink-0 overflow-hidden"
          style={{ perspective: "1100px" }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-full h-full"
          >
            {/* Clip-path wipe transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={"poster-" + activeIdx}
                className="absolute inset-0"
                initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.08 }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                exit={{ clipPath: "inset(0% 0% 100% 0%)", scale: 1.04 }}
                transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
              >
                <img
                  src={cur.img}
                  alt={cur.title}
                  className="w-full h-full object-cover"
                  style={{ willChange: "transform" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020202] opacity-0 md:opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/85 via-[#020202]/20 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Mouse-driven shine */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-10"
              style={{ background: shine }}
            />

            {/* Counter badge */}
            <div className="absolute top-6 left-6 md:top-9 md:left-9 z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={"ctr-" + activeIdx}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 18 }}
                  transition={{ duration: 0.38 }}
                >
                  <div
                    className="h-[2px] w-7 rounded-full"
                    style={{ background: cur.accent }}
                  />
                  <span className="text-[10px] tracking-[0.45em] text-white/35 font-bold uppercase">
                    {cur.num} / 0{roster.length}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Genre pill */}
            <div className="absolute bottom-6 left-6 md:bottom-9 md:left-9 z-20">
              <AnimatePresence mode="wait">
                <motion.span
                  key={"genre-" + activeIdx}
                  className="inline-flex px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-black tracking-[0.35em] uppercase backdrop-blur-md border"
                  style={{
                    color: cur.accent,
                    borderColor: cur.accent + "45",
                    background: cur.accent + "11",
                  }}
                  initial={{ opacity: 0, y: 14, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.9 }}
                  transition={{ duration: 0.44 }}
                >
                  {cur.genre}
                </motion.span>
              </AnimatePresence>
            </div>

            <motion.div
              className="absolute inset-0 pointer-events-none z-20"
              animate={{
                boxShadow: `inset 0 0 0 1px ${cur.accent}18, inset 0 -80px 80px -20px ${cur.accent}07`,
              }}
              transition={{ duration: 0.75 }}
            />
          </motion.div>
        </div>

        {/* INFO PANEL */}
        <div className="relative w-full md:w-[42%] h-[48vh] md:h-full flex flex-col justify-center px-7 md:px-12 lg:px-16 gap-4 md:gap-6 overflow-hidden">
          <motion.div
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[45%] rounded-full"
            animate={{ background: cur.accent, opacity: 0.2 }}
            transition={{ duration: 0.6 }}
          />

          <p className="text-[9px] md:text-[10px] tracking-[0.55em] text-white/20 uppercase font-bold">
            Legends Archive
          </p>

          {/* Ghost index */}
          {/* <div className="relative h-12 md:h-20 overflow-hidden pointer-events-none select-none"> */}
            <div className="relative h-24 md:h-32 pointer-events-none select-none">
            <AnimatePresence mode="wait">
              <motion.span
                key={"idx-" + activeIdx}
                className="absolute inset-0 flex items-center font-black text-[4rem] md:text-[7rem] leading-none"
                style={{
                  WebkitTextStroke: `2px ${cur.accent}22`,
                  color: "transparent",
                }}
                initial={{ opacity: 0, x: -24, filter: "blur(12px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 24, filter: "blur(12px)" }}
                transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
              >
                {cur.num}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={"title-" + activeIdx}
              exit={{ opacity: 0, y: -14, transition: { duration: 0.22 } }}
            >
              <WordReveal
                text={cur.title}
                delay={0.04}
                className="text-[1.5rem] md:text-[2rem] lg:text-[2.6rem] xl:text-[3rem] font-black text-white leading-tight tracking-tight"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradient rule */}
          <AnimatePresence mode="wait">
            <motion.div
              key={"rule-" + activeIdx}
              className="h-[1px] rounded-full origin-left"
              style={{
                background: `linear-gradient(to right, ${cur.accent}60, transparent)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, originX: 1, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.7,
                delay: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </AnimatePresence>

          {/* Stats */}
          <AnimatePresence mode="wait">
            <motion.div
              key={"stats-" + activeIdx}
              className="flex gap-7 md:gap-10 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.5,
                delay: 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[9px] tracking-[0.38em] text-white/25 uppercase font-semibold">
                  Rating
                </span>
                <span
                  className="text-xl md:text-2xl font-black"
                  style={{ color: cur.accent }}
                >
                  ★ {cur.rating}
                </span>
              </div>
              <div
                className="w-[1px] h-9 rounded-full"
                style={{ background: cur.accent + "20" }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-[9px] tracking-[0.38em] text-white/25 uppercase font-semibold">
                  Episodes
                </span>
                <span
                  className="text-xl md:text-2xl font-black"
                  style={{ color: cur.accent }}
                >
                  {cur.ep < 2 ? "Film" : cur.ep + " EP"}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <AnimatePresence mode="wait">
            <motion.button
              key={"cta-" + activeIdx}
              className="self-start relative flex items-center gap-2.5 px-6 md:px-8 py-3 rounded-full text-xs md:text-sm font-black tracking-[0.18em] uppercase overflow-hidden group"
              style={{ border: `1px solid ${cur.accent}40`, color: cur.accent }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{
                duration: 0.52,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.span
                className="absolute inset-0 z-0 origin-left"
                style={{ background: cur.accent }}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                Watch Series
              </span>
              <motion.span
                className="relative z-10 group-hover:text-black transition-colors duration-300 text-base"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                }}
              >
                →
              </motion.span>
            </motion.button>
          </AnimatePresence>

          {/* Progress pills */}
          <div className="flex gap-2 items-center">
            {roster.map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                animate={{
                  width: i === activeIdx ? 28 : 6,
                  height: 4,
                  backgroundColor:
                    i === activeIdx
                      ? cur.accent
                      : i < activeIdx
                        ? cur.accent + "55"
                        : "rgba(255,255,255,0.10)",
                }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04] z-30">
        <motion.div
          className="h-full"
          style={{ background: cur.accent }}
          animate={{ width: ((activeIdx + 1) / roster.length) * 100 + "%" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Scroll hint (first item only) */}
      <AnimatePresence>
        {activeIdx === 0 && (
          <motion.div
            className="absolute bottom-8 right-8 md:bottom-10 md:right-12 z-30 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
          >
            <motion.div
              className="w-[1px] h-10 md:h-14 rounded-full origin-top"
              style={{ background: cur.accent + "55" }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{
                duration: 2.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span
              className="text-[8px] tracking-[0.45em] uppercase font-bold rotate-90 mt-1"
              style={{ color: cur.accent, opacity: 0.45 }}
            >
              Scroll
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
