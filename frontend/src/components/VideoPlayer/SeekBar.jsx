import React, { useRef, useState, useEffect } from "react"
import gsap from "gsap"
import { cn } from "./utils/cn"
import { formatTime } from "./utils/formatTime"

export default function SeekBar({
  duration,
  currentTime,
  buffered,
  onSeek,
  className,
}) {
  const barRef = useRef(null)
  const progressRef = useRef(null)
  const bufferRef = useRef(null)
  const handleRef = useRef(null)
  const tooltipRef = useRef(null)

  const [isDragging, setIsDragging] = useState(false)
  const [hoverTime, setHoverTime] = useState(0)
  const [hoverPos, setHoverPos] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  // Update visual progress via GSAP for maximum performance (avoids React re-renders)
  useEffect(() => {
    if (!isDragging && duration > 0) {
      const progressPercent = (currentTime / duration) * 100
      gsap.set(progressRef.current, { width: `${progressPercent}%` })
    }

    if (duration > 0) {
      const bufferPercent = (buffered / duration) * 100
      gsap.set(bufferRef.current, { width: `${bufferPercent}%` })
    }
  }, [currentTime, buffered, duration, isDragging])

  const handlePointerDown = (e) => {
    setIsDragging(true)
    updateScrub(e)
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  const handlePointerMove = (e) => {
    updateScrub(e)
  }

  const handlePointerUp = (e) => {
    setIsDragging(false)
    updateScrub(e, true)
    window.removeEventListener("pointermove", handlePointerMove)
    window.removeEventListener("pointerup", handlePointerUp)
  }

  const updateScrub = (e, triggerSeek = false) => {
    if (!barRef.current || duration === 0) return
    const rect = barRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percentage = x / rect.width

    gsap.set(progressRef.current, { width: `${percentage * 100}%` })

    if (triggerSeek) {
      onSeek(percentage * duration)
    }
  }

  const handleHover = (e) => {
    if (!barRef.current || duration === 0) return
    const rect = barRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setHoverPos(x)
    setHoverTime((x / rect.width) * duration)
    setIsHovering(true)
  }

  return (
    <div
      className={cn(
        "w-full h-5 flex items-center group/seekbar cursor-pointer relative",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handleHover}
      onPointerLeave={() => setIsHovering(false)}
    >
      {/* Tooltip Hover Preview */}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute bottom-8 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none transition-opacity duration-200",
          isHovering ? "opacity-100" : "opacity-0",
        )}
        style={{ left: hoverPos }}
      >
        {formatTime(hoverTime)}
      </div>

      <div
        ref={barRef}
        className="relative w-full h-1.5 bg-slate-600/50 rounded-full transition-all duration-200 group-hover/seekbar:h-2"
      >
        {/* Buffered */}
        <div
          ref={bufferRef}
          className="absolute top-0 left-0 h-full bg-slate-400/40 rounded-full"
          style={{ width: "0%" }}
        />

        {/* Active Progress */}
        <div
          ref={progressRef}
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full flex items-center justify-end"
          style={{ width: "0%" }}
        >
          {/* Handle */}
          <div
            ref={handleRef}
            className={cn(
              "absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg shadow-blue-500/50 transition-transform duration-200 origin-center",
              isDragging || isHovering ? "scale-100" : "scale-0",
            )}
          />
        </div>
      </div>
    </div>
  )
}
