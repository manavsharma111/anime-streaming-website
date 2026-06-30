import React from "react"
import { Play, Pause } from "lucide-react"
import { cn } from "./utils/cn"

export default function PlayPauseButton({ isPlaying, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-white hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-white/10 active:scale-95",
        className,
      )}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? (
        <Pause size={24} fill="currentColor" />
      ) : (
        <Play size={24} fill="currentColor" className="ml-1" /> // Visual offset for play icon
      )}
    </button>
  )
}
