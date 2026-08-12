import React, { useState } from "react"
import { motion } from "framer-motion"

export default function ExpandableText({
  text,
  fallbackText = "No description available.",
  maxLength = 200,
  containerClassName = "mb-6",
  textClassName = "text-sm leading-relaxed text-neutral-300",
  buttonClassName = "text-[#f33767] text-xs font-bold mt-2 hover:underline focus:outline-none",
  lineClampClass = "line-clamp-3",
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div layout className={containerClassName}>
      <motion.p
        layout
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`${textClassName} ${isExpanded ? "" : `${lineClampClass} cursor-pointer`}`}
      >
        {text || fallbackText}
      </motion.p>
      {text && text.length > maxLength && (
        <motion.button
          layout
          onClick={() => setIsExpanded(!isExpanded)}
          className={buttonClassName}
        >
          {isExpanded ? "Show Less" : "Read More"}
        </motion.button>
      )}
    </motion.div>
  )
}
