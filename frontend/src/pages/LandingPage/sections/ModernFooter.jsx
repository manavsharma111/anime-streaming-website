import React from "react"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"

export default function ModernFooter() {
  return (
    <footer className="bg-[#020202] border-t border-white/[0.06] py-16 px-6 relative z-10">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 text-center">

        {/* Brand */}
        <p className="text-white/20 text-xs tracking-[0.5em] uppercase font-bold">
          Anime Stream
        </p>

        {/* Credit line */}
        <p className="text-white/40 text-sm md:text-base leading-relaxed">
          This website is designed and developed by{" "}
          <span className="text-white font-semibold">Manav Sharma</span>.
        </p>

        {/* Subline */}
        <p className="text-white/25 text-xs md:text-sm">
          Want to build something like this? Contact him.
        </p>

        {/* CTA */}
        <motion.a
          href="mailto:manavsharma3825@gmail.com"
          className="flex items-center gap-2.5 px-7 py-3 rounded-full border border-white/15 text-white/60 text-sm font-semibold tracking-widest uppercase hover:border-white/40 hover:text-white transition-all duration-300 group"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Mail size={15} className="text-white/40 group-hover:text-white transition-colors duration-300" />
          Contact Him
        </motion.a>

        {/* Divider */}
        <div className="w-16 h-[1px] bg-white/10 mt-2" />

        {/* Copyright */}
        <p className="text-white/15 text-xs tracking-widest">
          © {new Date().getFullYear()} Anime Stream. All rights reserved.
        </p>

      </div>
    </footer>
  )
}
