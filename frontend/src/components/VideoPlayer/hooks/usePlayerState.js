import { useState, useCallback } from "react"

export const usePlayerState = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const [showSettings, setShowSettings] = useState(false)
  const [showSkipIntro, setShowSkipIntro] = useState(false)
  const [showSkipOutro, setShowSkipOutro] = useState(false)

  const [isBuffering, setIsBuffering] = useState(false)

  const togglePlay = useCallback((videoElement) => {
    if (!videoElement) return
    if (videoElement.paused) {
      videoElement.play()
    } else {
      videoElement.pause()
    }
  }, [])

  const toggleMute = useCallback((videoElement) => {
    if (!videoElement) return
    videoElement.muted = !videoElement.muted
    setIsMuted(videoElement.muted)
  }, [])

  const changeVolume = useCallback(
    (videoElement, newVolume) => {
      if (!videoElement) return
      const vol = Math.max(0, Math.min(1, newVolume))
      videoElement.volume = vol
      setVolume(vol)
      if (vol === 0) {
        videoElement.muted = true
        setIsMuted(true)
      } else if (isMuted) {
        videoElement.muted = false
        setIsMuted(false)
      }
    },
    [isMuted],
  )

  return {
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    volume,
    setVolume,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    buffered,
    setBuffered,
    playbackSpeed,
    setPlaybackSpeed,
    showSettings,
    setShowSettings,
    showSkipIntro,
    setShowSkipIntro,
    showSkipOutro,
    setShowSkipOutro,
    isBuffering,
    setIsBuffering,
    togglePlay,
    toggleMute,
    changeVolume,
  }
}
