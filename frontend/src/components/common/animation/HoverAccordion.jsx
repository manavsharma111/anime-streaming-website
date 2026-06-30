import React, { useState, useEffect } from "react"

export default function HoverAccordion({
  items,
  autoPlayInterval = 8000,
  renderBackground,
  renderCollapsed,
  renderExpanded,
  containerClassName = "relative w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl flex gap-1 bg-black",
  activeFlex = "flex-[6] md:flex-[8]",
  inactiveFlex = "flex-1 md:flex-[1.5]",
  keyExtractor,
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!items || items.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length)
    }, autoPlayInterval)
    return () => clearInterval(interval)
  }, [items, autoPlayInterval])

  if (!items || !items.length) return null

  return (
    <div className={containerClassName}>
      {items.map((item, index) => {
        const isActive = activeIndex === index
        const key = keyExtractor ? keyExtractor(item, index) : index

        return (
          <div
            key={key}
            onMouseEnter={() => setActiveIndex(index)}
            className={`relative h-full transition-all duration-500 ease-in-out cursor-pointer overflow-hidden ${
              isActive ? activeFlex : inactiveFlex
            }`}
          >
            {/* Background Layer (Images, Gradients, etc.) */}
            {renderBackground && renderBackground(item, isActive)}

            {/* Collapsed State Content */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isActive ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              {renderCollapsed && renderCollapsed(item, isActive)}
            </div>

            {/* Expanded State Content */}
            <div
              className={`absolute inset-0 flex flex-col justify-end z-10 transition-all duration-500 delay-100 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
            >
              {renderExpanded && renderExpanded(item, isActive)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
