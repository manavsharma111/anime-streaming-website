import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

export const useHls = (streamUrl, videoRef) => {
  const [qualities, setQualities] = useState([])
  const [audioTracks, setAudioTracks] = useState([])
  const [subtitleTracks, setSubtitleTracks] = useState([])

  const [currentQuality, setCurrentQuality] = useState(-1)
  const [currentAudio, setCurrentAudio] = useState(0)
  const [currentSubtitle, setCurrentSubtitle] = useState(-1) // -1 means disabled

  const hlsRef = useRef(null)

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
    }

    if (Hls.isSupported() && streamUrl.includes(".m3u8")) {
      const hls = new Hls({
        maxBufferLength: 30,
        capLevelToPlayerSize: true,
      })

      hls.loadSource(streamUrl)
      hls.attachMedia(videoRef.current)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Fetch and deduplicate qualities by height, keeping the highest bitrate for each height
        const uniqueLevels = {}
        hls.levels.forEach((level, index) => {
          if (level.height) {
            if (
              !uniqueLevels[level.height] ||
              uniqueLevels[level.height].bitrate < level.bitrate
            ) {
              uniqueLevels[level.height] = { ...level, originalIndex: index }
            }
          }
        })

        // Convert back to array, sort descending (1080p -> 720p -> etc)
        const levels = Object.values(uniqueLevels)
          .sort((a, b) => b.height - a.height)
          .map((level) => ({
            id: level.originalIndex, // MUST use original index to tell HLS which level to switch to
            name: `${level.height}p`,
          }))

        setQualities([{ id: -1, name: "Auto" }, ...levels])

        // Fetch audio tracks
        const audios = hls.audioTracks || []
        console.log("Audio Tracks parsed:", audios)
        setAudioTracks(audios)

        // Fetch subtitle tracks
        const subs = hls.subtitleTracks || []
        console.log("Subtitle Tracks parsed:", subs)
        setSubtitleTracks([{ id: -1, name: "Off" }, ...subs])

        // Apply saved preferences if available
        const savedQuality = localStorage.getItem("preferredQuality")
        if (savedQuality) {
          const matchedLevel = levels.find((l) => l.name === savedQuality)
          if (matchedLevel) {
            hls.currentLevel = matchedLevel.id
            setCurrentQuality(matchedLevel.id)
          }
        }

        const savedAudio = localStorage.getItem("preferredAudio")
        if (savedAudio && audios.length > 0) {
          const matchedAudio = audios.find((a) => a.name === savedAudio || a.lang === savedAudio)
          if (matchedAudio) {
            hls.audioTrack = matchedAudio.id
            setCurrentAudio(matchedAudio.id)
          }
        }

        const savedSubtitle = localStorage.getItem("preferredSubtitle")
        if (savedSubtitle && subs.length > 0) {
          const matchedSub = subs.find((s) => s.name === savedSubtitle || s.lang === savedSubtitle)
          if (matchedSub) {
            hls.subtitleTrack = matchedSub.id
            setCurrentSubtitle(matchedSub.id)
          } else if (savedSubtitle === "Off") {
            hls.subtitleTrack = -1
            setCurrentSubtitle(-1)
          }
        }
      })

      // Fetch Audio Tracks when they are updated
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => {
        console.log("Audio Tracks Updated:", data.audioTracks)
        setAudioTracks(data.audioTracks || [])
      })

      // Fetch Subtitle Tracks when they are updated
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
        console.log("Subtitle Tracks Updated:", data.subtitleTracks)
        setSubtitleTracks([
          { id: -1, name: "Off" },
          ...(data.subtitleTracks || []),
        ])
      })

      // Track quality changes
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(hls.autoLevelEnabled ? -1 : data.level)
      })

      // Track audio changes
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
        setCurrentAudio(data.id)
      })

      // Track subtitle changes
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
        setCurrentSubtitle(data.id)
      })

      // Handle Errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data.type, data.details, data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad() // Try to recover
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break
            default:
              hls.destroy()
              break
          }
        }
      })

      hlsRef.current = hls
    }
    // Fallback for native Safari HLS OR direct video files (MP4/MKV)
    else if (
      videoRef.current.canPlayType("application/vnd.apple.mpegurl") ||
      !streamUrl.includes(".m3u8")
    ) {
      videoRef.current.src = streamUrl
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [streamUrl, videoRef])

  const changeQuality = (levelId) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId
      setCurrentQuality(levelId)
      // Save to localStorage
      if (levelId === -1) {
        localStorage.setItem("preferredQuality", "Auto")
      } else {
        const level = qualities.find((q) => q.id === levelId)
        if (level) localStorage.setItem("preferredQuality", level.name)
      }
    }
  }

  const changeAudioTrack = (trackId) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId
      setCurrentAudio(trackId)
      // Save to localStorage
      const track = audioTracks.find((a) => a.id === trackId)
      if (track) localStorage.setItem("preferredAudio", track.name || track.lang)
    }
  }

  const changeSubtitleTrack = (trackId) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = trackId
      setCurrentSubtitle(trackId)
      // Save to localStorage
      if (trackId === -1) {
        localStorage.setItem("preferredSubtitle", "Off")
      } else {
        const track = subtitleTracks.find((s) => s.id === trackId)
        if (track) localStorage.setItem("preferredSubtitle", track.name || track.lang)
      }
    }
  }

  return {
    qualities,
    audioTracks,
    subtitleTracks,
    currentQuality,
    currentAudio,
    currentSubtitle,
    changeQuality,
    changeAudioTrack,
    changeSubtitleTrack,
  }
}
