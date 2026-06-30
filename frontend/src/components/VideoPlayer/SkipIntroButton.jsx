import React from "react"
import { FastForward } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SkipIntroButton({
  show,
  label,
  onClick,
  isIntro = true,
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className={`absolute bottom-12 right-4 md:bottom-24 md:right-8 backdrop-blur-xl text-white text-xs md:text-sm font-bold py-2 px-3 md:py-3 md:px-6 rounded-lg border shadow-2xl flex items-center gap-1.5 md:gap-2 z-40 select-none ${
            isIntro
              ? "bg-slate-900/80 border-blue-500/50 hover:bg-slate-800"
              : "bg-slate-900/80 border-purple-500/50 hover:bg-slate-800"
          }`}
        >
          <FastForward
            size={18}
            className={isIntro ? "text-blue-400" : "text-purple-400"}
          />
          {label}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
