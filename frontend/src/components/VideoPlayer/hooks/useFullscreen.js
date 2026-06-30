import { useState, useEffect, useCallback } from "react"

export const useFullscreen = (containerRef) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement)
  }, [])

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [handleFullscreenChange])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [containerRef])

  return { isFullscreen, toggleFullscreen }
}
