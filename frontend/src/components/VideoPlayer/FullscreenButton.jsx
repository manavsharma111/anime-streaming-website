import React from "react"
import { Maximize, Minimize } from "lucide-react"
import { cn } from "./utils/cn"

export default function FullscreenButton({ isFullscreen, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-white hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-white/10 active:scale-95",
        className,
      )}
      aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
    </button>
  )
}
