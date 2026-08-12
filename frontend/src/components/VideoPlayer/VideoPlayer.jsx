import React, { useRef, useEffect } from "react"
import { cn } from "./utils/cn"
import "./styles/player.css"

// Hooks
import { usePlayerState } from "./hooks/usePlayerState"
import { useHls } from "./hooks/useHls"
import { useControls } from "./hooks/useControls"
import { useFullscreen } from "./hooks/useFullscreen"
import { useKeyboard } from "./hooks/useKeyboard"
import { useGestures } from "./hooks/useGestures"

// Components
import TopBar from "./TopBar"
import BottomBar from "./BottomBar"
import BufferLoader from "./BufferLoader"
import SkipIntroButton from "./SkipIntroButton"

export default function VideoPlayer({
  streamUrl,
  title,
  episodeData,
  initialTime = 0,
  onProgressSync,
  onBack,
  autoPlay = true,
  autoSkip = false,
  hasNextEpisode = false,
  autoNext = true,
  onPlayNext,
  onEnded,
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)

  const { introStart, introEnd, outroStart, outroEnd } = episodeData || {}

  // State Hook
  const playerState = usePlayerState()
  const {
    isPlaying,
    setIsPlaying,
    isMuted,
    volume,
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
  } = playerState

  // HLS Hook
  const {
    qualities,
    audioTracks,
    subtitleTracks: hlsSubtitleTracks,
    currentQuality,
    currentAudio,
    currentSubtitle: hlsCurrentSubtitle,
    changeQuality,
    changeAudioTrack,
    changeSubtitleTrack: changeHlsSubtitleTrack,
  } = useHls(streamUrl, videoRef)

  // Custom Subtitle State for External VTTs
  const [extSubtitle, setExtSubtitle] = React.useState(-1)
  const hasExternalSubs =
    episodeData?.subtitleTracks && episodeData.subtitleTracks.length > 0

  let finalSubtitleTracks = hlsSubtitleTracks
  if (hasExternalSubs) {
    const langCounts = {}
    episodeData.subtitleTracks.forEach((sub) => {
      langCounts[sub.lang] = (langCounts[sub.lang] || 0) + 1
    })
    const currentLangCount = {}

    finalSubtitleTracks = [
      { id: -1, name: "Off" },
      ...episodeData.subtitleTracks.map((sub, i) => {
        currentLangCount[sub.lang] = (currentLangCount[sub.lang] || 0) + 1
        const langName = sub.lang.toUpperCase()
        const displayName =
          langCounts[sub.lang] > 1
            ? `${langName} ${currentLangCount[sub.lang]}`
            : langName
        return { id: i, name: displayName }
      }),
    ]
  }
  const subtitleTracks = finalSubtitleTracks
  const currentSubtitle = hasExternalSubs ? extSubtitle : hlsCurrentSubtitle

  const changeSubtitleTrack = (trackId) => {
    if (hasExternalSubs) {
      if (videoRef.current) {
        const tracks = videoRef.current.textTracks
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].mode = i === trackId ? "showing" : "hidden"
        }
      }
      setExtSubtitle(trackId)
    } else {
      changeHlsSubtitleTrack(trackId)
    }
  }

  // UI Controls Hook
  const { showControls, keepAlive, hideNow } = useControls(3000, showSettings)

  // Fullscreen Hook
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef)

  // Keyboard Shortcuts Hook
  useKeyboard(videoRef, {
    togglePlay: () => togglePlay(videoRef.current),
    toggleFullscreen,
    toggleMute: () => toggleMute(videoRef.current),
    changeVolume: (v) => changeVolume(videoRef.current, v),
    changePlaybackSpeed: (s) => {
      if (videoRef.current) videoRef.current.playbackRate = s
      setPlaybackSpeed(s)
    },
  })

  // Gestures Hook
  useGestures(containerRef, videoRef, {
    togglePlay: () => togglePlay(videoRef.current),
    onDoubleTapLeft: () => {
      if (videoRef.current) videoRef.current.currentTime -= 10
    },
    onDoubleTapRight: () => {
      if (videoRef.current) videoRef.current.currentTime += 10
    },
  })

  // Video Native Event Handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const time = videoRef.current.currentTime
    setCurrentTime(time)

    // Buffer tracking
    if (videoRef.current.buffered.length > 0) {
      setBuffered(
        videoRef.current.buffered.end(videoRef.current.buffered.length - 1),
      )
    }

    // Skip logic
    const inIntro = introEnd > 0 && time >= introStart && time <= introEnd
    const inOutro = outroEnd > 0 && time >= outroStart && time <= outroEnd

    setShowSkipIntro(inIntro)
    setShowSkipOutro(inOutro)

    // AutoSkip execution
    if (autoSkip) {
      if (inIntro) {
        videoRef.current.currentTime = introEnd
      } else if (inOutro) {
        videoRef.current.currentTime = outroEnd
      }
    }

    // Sync Telemetry every 10s
    if (onProgressSync && Math.floor(time) > 0 && Math.floor(time) % 10 === 0) {
      onProgressSync(
        Math.floor(time),
        Math.floor(videoRef.current.duration || 0),
      )
    }
  }

  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)
  const handleWaiting = () => setIsBuffering(true)
  const handlePlaying = () => setIsBuffering(false)
  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0)
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime
    }
  }

  // Countdown Logic
  const [countdown, setCountdown] = React.useState(null)

  const handleVideoEnded = () => {
    if (hasNextEpisode && autoNext && onPlayNext) {
      setCountdown(10)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error)
      }
    } else if (onEnded) {
      onEnded()
    }
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      setCountdown(null)
      if (onPlayNext) onPlayNext()
      return
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown, onPlayNext])

  const cancelCountdown = () => {
    setCountdown(null)
  }

  // Expose settings props for BottomBar
  const settingsProps = {
    showSettings,
    setShowSettings,
    qualities,
    audioTracks,
    subtitleTracks,
    currentQuality,
    currentAudio,
    currentSubtitle,
    playbackSpeed,
    downloadQualities: episodeData?.downloadQualities,
    videoUrl: episodeData?.videoUrl,
    onQualityChange: changeQuality,
    onAudioChange: changeAudioTrack,
    onSubtitleChange: changeSubtitleTrack,
    onSpeedChange: (s) => {
      if (videoRef.current) videoRef.current.playbackRate = s
      setPlaybackSpeed(s)
    },
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={keepAlive}
      onMouseLeave={hideNow}
      className={cn(
        "relative w-full bg-transparent group select-none player-container font-sans text-white shadow-2xl",
        isFullscreen ? "h-screen w-screen" : "aspect-video",
      )}
    >
      {/* NATIVE VIDEO ELEMENT */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full bg-black z-0",
          !isFullscreen &&
            "rounded-2xl overflow-hidden border border-slate-800",
        )}
      >
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onEnded={handleVideoEnded}
          onClick={() => togglePlay(videoRef.current)}
          className="w-full h-full object-cover"
          playsInline
          autoPlay={autoPlay}
          crossOrigin="anonymous"
        >
          {episodeData?.subtitleTracks?.map((sub, index) => (
            <track
              key={index}
              kind="subtitles"
              src={
                sub.url.startsWith("http")
                  ? sub.url
                  : `${import.meta.env.VITE_BASE_URL || "http://localhost:4000"}${sub.url}`
              }
              srcLang={sub.lang}
              label={sub.lang}
              default={index === 0}
            />
          ))}
        </video>
      </div>

      {/* OVERLAYS & CONTROLS */}
      <BufferLoader isBuffering={isBuffering} />

      <TopBar title={title} onBack={onBack} />

      <BottomBar
        showControls={showControls}
        isPlaying={isPlaying}
        togglePlay={() => togglePlay(videoRef.current)}
        isMuted={isMuted}
        toggleMute={() => toggleMute(videoRef.current)}
        volume={volume}
        changeVolume={(v) => changeVolume(videoRef.current, v)}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        onSeek={(targetTime) => {
          if (videoRef.current) videoRef.current.currentTime = targetTime
        }}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        videoRef={videoRef}
        settingsProps={settingsProps}
      />

      {/* SKIP BUTTONS */}
      <SkipIntroButton
        show={showSkipIntro || showSkipOutro}
        onClick={() => {
          if (showSkipIntro && introEnd) videoRef.current.currentTime = introEnd
          if (showSkipOutro && outroEnd) videoRef.current.currentTime = outroEnd
        }}
        label={showSkipIntro ? "Skip Intro" : "Skip Outro"}
      />

      {/* Auto-Play Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity duration-500">
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-wider">
              Up Next
            </h2>
            <p className="text-neutral-400 text-sm md:text-base font-medium mb-8">
              Starting in{" "}
              <span className="text-white font-bold">{countdown}</span> seconds
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button
                onClick={() => {
                  setCountdown(null)
                  if (onPlayNext) onPlayNext()
                }}
                className="px-8 py-3 bg-[#f33767] hover:bg-[#ff7eb3] transition-colors rounded-full text-white font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(243,55,103,0.4)]"
              >
                Play Now
              </button>
              <button
                onClick={cancelCountdown}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors rounded-full text-white font-bold uppercase tracking-widest text-sm backdrop-blur-md"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Circular Progress Indicator */}
          <div className="absolute top-8 right-8 w-16 h-16 pointer-events-none opacity-50">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-neutral-800"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="175"
                strokeDashoffset={175 - (175 * countdown) / 10}
                className="text-[#f33767] transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
              {countdown}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
