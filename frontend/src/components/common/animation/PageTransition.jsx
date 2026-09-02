import React from "react"
import { motion } from "framer-motion"

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 15,
    filter: "blur(4px)"
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -15,
    filter: "blur(4px)",
    transition: { 
      duration: 0.3, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
