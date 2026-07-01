import React from "react"
import { motion } from "framer-motion"
import {
  Zap,
  MonitorPlay,
  AudioLines,
  ShieldCheck,
  Flame,
  Search,
  Play,
  Heart,
} from "lucide-react"

const FEATURES = [
  {
    title: "Ultra-Fast Delivery",
    description:
      "No buffering, no waiting. Experience ultra-fast global CDN delivery tailored for smooth playback.",
    icon: <Zap size={28} />,
    color: "#f33767",
    size: "large",
  },
  {
    title: "4K & 1080p Quality",
    description:
      "Crystal clear anime in the highest possible resolution available.",
    icon: <MonitorPlay size={28} />,
    color: "#3B82F6",
    size: "medium",
  },
  {
    title: "Dual Audio & Subs",
    description:
      "Seamlessly switch between Japanese audio and English dubs instantly.",
    icon: <AudioLines size={28} />,
    color: "#22C55E",
    size: "medium",
  },
  {
    title: "Trending Catalog",
    description: "Always updated with the latest episodes and seasonal hits.",
    icon: <Flame size={28} />,
    color: "#F97316",
    size: "small",
  },
  {
    title: "Smart Search",
    description: "Find exactly what you want with our advanced genre filters.",
    icon: <Search size={28} />,
    color: "#A855F7",
    size: "small",
  },
  {
    title: "Simulcasts",
    description: "Watch episodes the same day they air in Japan.",
    icon: <Play size={28} />,
    color: "#EAB308",
    size: "small",
  },
  {
    title: "Watchlists",
    description: "Keep track of all your favorite shows in one place.",
    icon: <Heart size={28} />,
    color: "#F43F5E",
    size: "small",
  },
  {
    title: "Ad-Free & Secure",
    description: "Zero interruptions. 100% safe platform built for otakus.",
    icon: <ShieldCheck size={28} />,
    color: "#10B981",
    size: "small",
  },
]

export default function FeaturesBentoGrid() {
  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 relative z-10 bg-[#0e0b12]">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
          Everything you need.
        </h2>
        <p className="text-xl text-[#A1A1AA]">
          A complete streaming platform with premium features, all built in for
          the perfect anime marathon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
        {FEATURES.map((feature, i) => {
          let sizeClass = ""
          if (feature.size === "large")
            sizeClass = "md:col-span-2 md:row-span-2"
          else if (feature.size === "medium")
            sizeClass = "md:col-span-2 lg:col-span-2"
          else sizeClass = "md:col-span-1"

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.1 }}
              className={`${sizeClass} group relative bg-[#111] border border-[#222] rounded-3xl p-8 flex flex-col justify-end overflow-hidden transition-all duration-500 cursor-default`}
            >
              {/* Large Background Watermark Icon */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 transform pointer-events-none">
                {React.cloneElement(feature.icon, { size: 160 })}
              </div>

              {/* Subtle inner glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
                style={{
                  background: `radial-gradient(600px circle at 50% 50%, ${feature.color}15, transparent 60%)`,
                }}
              ></div>

              {/* Glowing Border on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl border border-transparent"
                style={{
                  borderColor: feature.color,
                  boxShadow: `inset 0 0 20px ${feature.color}15, 0 0 20px ${feature.color}30`,
                }}
              ></div>

              {/* Icon */}
              <div
                className="mb-4 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${feature.color}15`,
                  color: feature.color,
                  border: `1px solid ${feature.color}30`,
                }}
              >
                {feature.icon}
              </div>

              {/* Text */}
              <h3 className="text-2xl font-bold mb-2 text-white relative z-10 group-hover:translate-x-1 transition-transform duration-300 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-[#888] leading-relaxed relative z-10 font-medium">
                {feature.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
