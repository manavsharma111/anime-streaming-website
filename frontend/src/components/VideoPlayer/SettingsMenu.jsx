import React, { useState, useEffect, useRef } from "react"
import {
  Settings,
  ChevronRight,
  ChevronLeft,
  Download
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "./utils/cn"

export default function SettingsMenu({
  showSettings,
  setShowSettings,
  qualities = [],
  audioTracks = [],
  subtitleTracks = [],
  currentQuality,
  currentAudio,
  currentSubtitle,
  playbackSpeed,
  subtitlePosition = "bottom",
  subtitleSize = 100,
  onQualityChange,
  onAudioChange,
  onSubtitleChange,
  onSpeedChange,
  onSubtitlePositionChange,
  onSubtitleSizeChange,
  downloadQualities = {},
  videoUrl,
  isFullscreen,
}) {
  const [activeMenu, setActiveMenu] = useState("main")

  const menuRef = useRef(null)

  useEffect(() => {
    if (!showSettings) {
      setTimeout(() => setActiveMenu("main"), 200)
    }
  }, [showSettings])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSettings, setShowSettings])

  const getFullUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    const backendUrl = import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL.replace("/api", "")
      : "http://localhost:8080"
    return `${backendUrl}${url}`
  }

  const displayAudioTracks = audioTracks.length > 0 ? audioTracks : [
    { id: 0, name: "Japanese (Original)" },
    { id: 1, name: "English (Dub)" },
    { id: 2, name: "Hindi (Dub)" },
  ]

  const displaySubtitleTracks = subtitleTracks.length > 1 ? subtitleTracks : [
    { id: -1, name: "Off" },
    { id: 0, name: "English (CC)" },
    { id: 1, name: "Spanish" },
    { id: 2, name: "Hindi" },
  ]

  const displayDownloadQualities = Object.keys(downloadQualities || {}).length > 0 ? downloadQualities : {
    "1080p (FHD)": videoUrl,
    "720p (HD)": videoUrl,
    "480p (SD)": videoUrl,
  }

  const getCurrentAudioLabel = () => displayAudioTracks.find(t => t.id === currentAudio)?.name || "Default"
  const getCurrentSubtitleLabel = () => displaySubtitleTracks.find(t => t.id === currentSubtitle)?.name || "Off"
  const getCurrentQualityLabel = () => {
    if (currentQuality === -1 || currentQuality === undefined) return "Auto"
    return qualities.find(q => q.id === currentQuality)?.name || "Auto"
  }
  const getSpeedLabel = () => playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`
  const getSubtitlePositionLabel = () => subtitlePosition === "top" ? "Top" : "Bottom"

  const renderList = (items, currentId, onSelect, labelKey = "name", idKey = "id", emptyMessage = "Default") => (
    <div className="flex flex-col py-1 pointer-events-auto">
      {items.length > 0 ? (
        items.map((item) => {
          const isActive = currentId === item[idKey]
          return (
            <button
              key={item[idKey]}
              onClick={() => {
                if (!isDragging) {
                  if(onSelect) onSelect(item[idKey])
                  setActiveMenu("main")
                }
              }}
              className="text-left px-5 py-3 text-[14px] transition-colors flex items-center gap-3 hover:bg-white/10"
            >
              <div className="w-4 flex justify-center text-[18px]">
                {isActive && "✓"}
              </div>
              <span className={isActive ? "text-white font-medium" : "text-neutral-300"}>
                {item[labelKey] || `Track ${item[idKey]}`}
              </span>
            </button>
          )
        })
      ) : (
        <div className="text-left px-5 py-3 text-[14px] text-neutral-500">
          {emptyMessage}
        </div>
      )}
    </div>
  )

  const renderMainMenuItem = (label, value, onClick) => (
    <button 
      onClick={() => { if (!isDragging) onClick() }}
      className="w-full text-left px-5 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group"
    >
      <div className="flex flex-col">
        <span className="text-[14px] font-medium text-neutral-200 group-hover:text-white transition-colors">{label}</span>
        {value && <span className="text-[12px] text-neutral-400 mt-0.5">{value}</span>}
      </div>
      <ChevronRight size={18} className="text-neutral-500 group-hover:text-white transition-colors" />
    </button>
  )

  const renderSubMenuHeader = (title) => (
    <div className="flex items-center px-2 py-2 border-b border-white/10">
      <button 
        onClick={() => { if (!isDragging) setActiveMenu("main") }}
        className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-300 hover:text-white"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="ml-2 text-[15px] font-semibold text-white">{title}</span>
    </div>
  )

  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef(null)

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartY(e.pageY - scrollRef.current.offsetTop)
    setScrollTop(scrollRef.current.scrollTop)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    // Adding a small timeout to prevent click events from firing immediately after drag
    setTimeout(() => setIsDragging(false), 50)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const y = e.pageY - scrollRef.current.offsetTop
    const walk = (y - startY) * 1.5
    scrollRef.current.scrollTop = scrollTop - walk
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={cn(
          "text-white hover:text-[#ff5722] transition-all p-2 rounded-full",
          showSettings && "text-[#ff5722] rotate-90"
        )}
      >
        <Settings size={20} className="transition-transform duration-300" />
      </button>

      <AnimatePresence mode="wait">
        {showSettings && (
          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute right-0 w-[260px] sm:w-[300px] bg-[#2a2d34]/95 backdrop-blur-xl rounded-xl shadow-2xl z-50 flex flex-col border border-white/10 overflow-hidden text-white pointer-events-auto font-sans cursor-grab active:cursor-grabbing",
              "bottom-full mb-3 origin-bottom-right max-h-[60vh] sm:max-h-[80vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            )}
            data-lenis-prevent="true"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {activeMenu === "main" && (
              <motion.div 
                key="main"
                initial={{ x: -20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="py-2 flex flex-col"
              >
                {renderMainMenuItem("Audio settings", getCurrentAudioLabel(), () => setActiveMenu("audio"))}
                {renderMainMenuItem("Subtitle settings", getCurrentSubtitleLabel(), () => setActiveMenu("subtitles"))}
                {renderMainMenuItem("Subtitle size", subtitleSize ? `${subtitleSize}%` : "100%", () => setActiveMenu("size"))}
                {renderMainMenuItem("Subtitle position", getSubtitlePositionLabel(), () => setActiveMenu("position"))}
                {renderMainMenuItem("Quality", getCurrentQualityLabel(), () => setActiveMenu("quality"))}
                {renderMainMenuItem("Playback speed", getSpeedLabel(), () => setActiveMenu("speed"))}
                {renderMainMenuItem("Download Options", "", () => setActiveMenu("download"))}
              </motion.div>
            )}

            {activeMenu === "quality" && (
              <motion.div key="quality" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col">
                {renderSubMenuHeader("Quality")}
                {renderList(
                  qualities.length > 0 ? qualities : [ { id: -1, name: "Auto (1080p)" }, { id: 2, name: "1080p" }, { id: 1, name: "720p" } ],
                  currentQuality,
                  onQualityChange,
                  "name", "id", "Auto (Default)"
                )}
              </motion.div>
            )}

            {activeMenu === "audio" && (
              <motion.div key="audio" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col">
                {renderSubMenuHeader("Audio settings")}
                {renderList(displayAudioTracks, currentAudio, onAudioChange, "name", "id", "Default Track")}
              </motion.div>
            )}

            {activeMenu === "subtitles" && (
              <motion.div key="subtitles" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col">
                {renderSubMenuHeader("Subtitle settings")}
                {renderList(displaySubtitleTracks, currentSubtitle, onSubtitleChange, "name", "id", "Off")}
              </motion.div>
            )}

            {activeMenu === "size" && (
              <motion.div key="size" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col">
                {renderSubMenuHeader("Subtitle Size")}
                <div className="flex flex-col py-1 pointer-events-auto">
                  {[50, 75, 90, 100, 110, 125, 150, 175].map((size) => {
                    const isActive = subtitleSize === size || (!subtitleSize && size === 100);
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          if (!isDragging) {
                            if (onSubtitleSizeChange) onSubtitleSizeChange(size);
                            setActiveMenu("main");
                          }
                        }}
                        className={cn(
                          "text-left px-5 py-4 text-[15px] transition-colors flex items-center hover:bg-white/5 border-l-[3px]",
                          isActive ? "border-[#29b6f6] bg-white/5" : "border-transparent text-neutral-300"
                        )}
                      >
                        <span className={isActive ? "text-white font-semibold" : "text-neutral-300 font-semibold"}>
                          {size}%
                        </span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeMenu === "position" && (
              <motion.div key="position" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col">
                {renderSubMenuHeader("Subtitle position")}
                {renderList(
                  [{ id: "bottom", name: "Bottom" }, { id: "top", name: "Top" }],
                  subtitlePosition,
                  onSubtitlePositionChange,
                  "name", "id", "Bottom"
                )}
              </motion.div>
            )}

            {activeMenu === "speed" && (
              <motion.div key="speed" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col">
                {renderSubMenuHeader("Playback speed")}
                <div className="px-5 py-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-neutral-400 text-[12px] font-medium">
                    <span>0.25x</span>
                    <span className="text-white font-bold text-[14px]">
                      {playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}
                    </span>
                    <span>2x</span>
                  </div>
                  <input
                    type="range" min="0.25" max="2" step="0.25" value={playbackSpeed}
                    onChange={(e) => {
                       if(onSpeedChange) onSpeedChange(parseFloat(e.target.value))
                    }}
                    className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </motion.div>
            )}

            {activeMenu === "download" && (
              <motion.div key="download" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col">
                {renderSubMenuHeader("Download Options")}
                <div className="flex flex-col py-2">
                  {Object.entries(displayDownloadQualities).map(([quality, url]) => (
                    <a
                      key={quality}
                      href={getFullUrl(url)}
                      download={`Episode_${quality}.mp4`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (isDragging) e.preventDefault();
                      }}
                      className="text-left px-5 py-3 text-[14px] font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">{quality}</span>
                      <Download size={16} className="opacity-70 group-hover:opacity-100 group-hover:text-[#ff5722] transition-all" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
