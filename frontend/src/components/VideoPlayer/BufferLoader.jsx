import React from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function BufferLoader({ isBuffering }) {
  return (
    <AnimatePresence>
      {isBuffering && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
