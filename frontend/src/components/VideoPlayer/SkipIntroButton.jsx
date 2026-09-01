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
          className="absolute bottom-20 right-6 md:bottom-24 md:right-8 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 text-xs md:text-sm font-medium py-2 px-4 rounded transition-colors flex items-center gap-2 z-20 select-none"
        >
          <FastForward size={16} className="text-white" />
          {label}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
