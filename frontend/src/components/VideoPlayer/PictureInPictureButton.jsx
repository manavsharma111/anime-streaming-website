import React from "react"
import { PictureInPicture } from "lucide-react"
import { cn } from "./utils/cn"

export default function PictureInPictureButton({ videoRef, className }) {
  const togglePip = async () => {
    if (!videoRef.current) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (err) {
      console.error("PIP Error:", err)
    }
  }

  if (!document.pictureInPictureEnabled) return null

  return (
    <button
      onClick={togglePip}
      className={cn(
        "text-white hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-white/10 active:scale-95",
        className,
      )}
      aria-label="Picture in Picture"
    >
      <PictureInPicture size={20} />
    </button>
  )
}
