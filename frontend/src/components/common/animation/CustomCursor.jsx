import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredElement, setHoveredElement] = useState(null)
  const [isOverPlayer, setIsOverPlayer] = useState(false)
  const [isOverInput, setIsOverInput] = useState(false)

  // Detect if it's a touch device or mobile
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 768
    ) {
      setIsTouchDevice(true)
    } else {
      document.body.classList.add("hide-cursor")
    }

    return () => {
      document.body.classList.remove("hide-cursor")
    }
  }, [])

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })

      // Hide custom cursor over video player
      if (e.target.closest(".player-container")) {
        setIsOverPlayer(true)
      } else {
        setIsOverPlayer(false)
      }

      // Hide custom cursor over all text inputs, textareas, selects, and editable areas
      // to let the natural system I-beam text cursor show cleanly
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) {
        setIsOverInput(true)
      } else {
        setIsOverInput(false)
      }
    }

    const handleMouseOver = (e) => {
      // Only snap to actual buttons, never cards, links, or inputs
      let target = e.target.closest('button, [role="button"]')

      // Ignore if inside nav or if it's a huge container
      if (!target || target.closest("nav")) {
        setHoveredElement(null)
        return
      }

      // Safety check: Don't snap to entire cards or large sections
      const rect = target.getBoundingClientRect()
      if (rect.width > 260 || rect.height > 80) {
        setHoveredElement(null)
        return
      }

      setHoveredElement(target)
    }

    const handleMouseOut = (e) => {
      let target = e.target.closest('button, [role="button"]')
      if (target) {
        setHoveredElement(null)
      }
    }

    const handleScroll = () => {
      setHoveredElement((prev) => (prev ? null : prev))
    }

    window.addEventListener("mousemove", updateMousePosition, { passive: true })
    window.addEventListener("mouseover", handleMouseOver, { passive: true })
    window.addEventListener("mouseout", handleMouseOut, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("mouseover", handleMouseOver)
      window.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const getHoverConfig = () => {
    if (!hoveredElement) return null
    const rect = hoveredElement.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(hoveredElement)
    const radius = computedStyle.borderRadius
    // Extra padding around the element
    const padding = 8
    return {
      x: rect.left - padding / 2,
      y: rect.top - padding / 2,
      width: rect.width + padding,
      height: rect.height + padding,
      borderRadius: radius === "0px" ? "8px" : radius,
    }
  }

  const hoverConfig = getHoverConfig()

  const isHidden = isOverPlayer || isOverInput

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      width: 32,
      height: 32,
      borderRadius: "50%",
      backgroundColor: "rgba(168, 85, 247, 0)",
      border: "1px solid rgba(168, 85, 247, 1)",
      opacity: isHidden ? 0 : 1,
    },
    hover: hoverConfig
      ? {
          x: hoverConfig.x,
          y: hoverConfig.y,
          width: hoverConfig.width,
          height: hoverConfig.height,
          borderRadius: hoverConfig.borderRadius,
          backgroundColor: "rgba(168, 85, 247, 0.15)",
          border: "1px solid rgba(168, 85, 247, 0.5)",
          opacity: isHidden ? 0 : 1,
        }
      : {},
  }

  if (isTouchDevice) return null

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999] hidden md:block"
        variants={variants}
        animate={hoveredElement && !isHidden ? "hover" : "default"}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      />
      {/* Dot Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#a855f7] rounded-full pointer-events-none z-[999999] hidden md:block"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          opacity: hoveredElement || isHidden ? 0 : 1,
          scale: hoveredElement || isHidden ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.1 }}
      />
    </>
  )
}

export default CustomCursor
