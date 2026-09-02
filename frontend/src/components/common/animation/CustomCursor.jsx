import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredElement, setHoveredElement] = useState(null)
  const [isOverPlayer, setIsOverPlayer] = useState(false)
  const [, setScrollForceUpdate] = useState(0)
  
  // Detect if it's a touch device or mobile
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768) {
      setIsTouchDevice(true)
    }
  }, [])

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
      
      // Hide custom cursor when hovering over the video player
      if (e.target.closest('.player-container')) {
        setIsOverPlayer(true)
      } else {
        setIsOverPlayer(false)
      }
    }

    const handleMouseOver = (e) => {
      const target = e.target.closest(
        'a, button, [role="button"], input, textarea, select, .cursor-pointer'
      )
      if (target) {
        setHoveredElement(target)
      }
    }

    const handleMouseOut = (e) => {
      const target = e.target.closest(
        'a, button, [role="button"], input, textarea, select, .cursor-pointer'
      )
      if (target) {
        setHoveredElement(null)
      }
    }
    
    const handleScroll = () => {
      if (hoveredElement) {
        setScrollForceUpdate(prev => prev + 1);
      }
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("mouseover", handleMouseOver)
    window.addEventListener("mouseout", handleMouseOut)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("mouseover", handleMouseOver)
      window.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [hoveredElement])

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

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      width: 32,
      height: 32,
      borderRadius: "50%",
      backgroundColor: "rgba(243, 55, 103, 0)",
      border: "1px solid rgba(243, 55, 103, 1)",
      opacity: isOverPlayer ? 0 : 1,
    },
    hover: hoverConfig ? {
      x: hoverConfig.x,
      y: hoverConfig.y,
      width: hoverConfig.width,
      height: hoverConfig.height,
      borderRadius: hoverConfig.borderRadius,
      backgroundColor: "rgba(243, 55, 103, 0.15)",
      border: "1px solid rgba(243, 55, 103, 0.5)",
      opacity: isOverPlayer ? 0 : 1,
    } : {},
  };

  const dotVariants = {
    default: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      scale: 1,
      opacity: isOverPlayer ? 0 : 1,
    },
    hover: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      scale: 0.5,
      opacity: 0,
    },
  };

  if (isTouchDevice) return null;

  return (
    <>
      <motion.div
        variants={variants}
        animate={hoveredElement ? "hover" : "default"}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{ transformOrigin: "center" }}
      />
      <motion.div
        variants={dotVariants}
        animate={hoveredElement ? "hover" : "default"}
        transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
        className="fixed top-0 left-0 w-2 h-2 bg-[#f33767] rounded-full pointer-events-none z-[9999] hidden md:block"
      />
    </>
  );
};

export default CustomCursor;
