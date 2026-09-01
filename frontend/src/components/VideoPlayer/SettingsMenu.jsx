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
  onQualityChange,
  onAudioChange,
  onSubtitleChange,
  onSpeedChange,
  onSubtitlePositionChange,
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
    <div className="flex flex-col py-1 max-h-[250px] overflow-y-auto custom-scrollbar pointer-events-auto">
      {items.length > 0 ? (
        items.map((item) => {
          const isActive = currentId === item[idKey]
          return (
            <button
              key={item[idKey]}
              onClick={() => {
                if(onSelect) onSelect(item[idKey])
                setActiveMenu("main")
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
      onClick={onClick}
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
        onClick={() => setActiveMenu("main")}
        className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-300 hover:text-white"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="ml-2 text-[15px] font-semibold text-white">{title}</span>
    </div>
  )

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
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute right-0 w-[260px] sm:w-[300px] bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl shadow-2xl z-50 flex flex-col border border-white/10 overflow-hidden text-white pointer-events-auto",
              "bottom-full mb-3 origin-bottom-right max-h-[160px] sm:max-h-[280px] md:max-h-[400px] overflow-y-auto custom-scrollbar"
            )}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
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
                <div className="flex flex-col py-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {Object.entries(displayDownloadQualities).map(([quality, url]) => (
                    <a
                      key={quality}
                      href={getFullUrl(url)}
                      download={`Episode_${quality}.mp4`}
                      target="_blank"
                      rel="noreferrer"
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
