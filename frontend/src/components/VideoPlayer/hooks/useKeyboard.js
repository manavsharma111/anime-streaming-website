import { useEffect } from "react"

export const useKeyboard = (videoRef, handlers) => {
  const {
    togglePlay,
    toggleFullscreen,
    toggleMute,
    changeVolume,
    changePlaybackSpeed,
  } = handlers

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement.tagName.toLowerCase()
      if (activeElement === "input" || activeElement === "textarea") return

      const video = videoRef.current
      if (!video) return

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay(video)
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        case "m":
          e.preventDefault()
          toggleMute(video)
          break
        case "arrowright":
          e.preventDefault()
          video.currentTime = Math.min(video.duration, video.currentTime + 10)
          break
        case "arrowleft":
          e.preventDefault()
          video.currentTime = Math.max(0, video.currentTime - 10)
          break
        case "arrowup":
          e.preventDefault()
          changeVolume(video, video.volume + 0.05)
          break
        case "arrowdown":
          e.preventDefault()
          changeVolume(video, video.volume - 0.05)
          break
        case ">":
          if (e.shiftKey) {
            e.preventDefault()
            changePlaybackSpeed(Math.min(2, video.playbackRate + 0.25))
          }
          break
        case "<":
          if (e.shiftKey) {
            e.preventDefault()
            changePlaybackSpeed(Math.max(0.25, video.playbackRate - 0.25))
          }
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    videoRef,
    togglePlay,
    toggleFullscreen,
    toggleMute,
    changeVolume,
    changePlaybackSpeed,
  ])
}
