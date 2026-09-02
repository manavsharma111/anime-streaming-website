import React, { useState } from "react"
import {
  Plus,
  Image as ImageIcon,
  Film,
  Calendar,
  Star,
  Info,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axiosInstance from "../../services/api"

export default function CreateAnime({ onSuccess }) {
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false)
  const [animeData, setAnimeData] = useState({
    title: "",
    description: "",
    genres: "",
    type: "TV",
    cover: "",
    thumbnail: "",
    trailerUrl: "",
    year: new Date().getFullYear(),
    rating: 8.0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreateAnimeSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const payload = {
        ...animeData,
        genres: [
          ...new Set(
            animeData.genres
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean),
          ),
        ],
      }
      await axiosInstance.post("/anime-admin/create", payload)
      setAnimeData({
        title: "",
        description: "",
        genres: "",
        type: "TV",
        cover: "",
        thumbnail: "",
        trailerUrl: "",
        year: new Date().getFullYear(),
        rating: 8.0,
      })
      if (onSuccess) onSuccess(animeData.title)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register series.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
            <Plus className="w-6 h-6" />
          </div>
          Register New Series
        </h2>
        <p className="text-neutral-400 text-sm">
          Add a new anime master record to the database before uploading
          episodes.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateAnimeSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4" /> Title
            </label>
            <input
              type="text"
              value={animeData.title}
              onChange={(e) =>
                setAnimeData({ ...animeData, title: e.target.value })
              }
              placeholder="e.g. Demon Slayer"
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white transition-colors"
              required
            />
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4" /> Genres
            </label>
            <input
              type="text"
              value={animeData.genres}
              onChange={(e) =>
                setAnimeData({ ...animeData, genres: e.target.value })
              }
              placeholder="Action, Fantasy, Shounen"
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white transition-colors"
              required
            />
          </div>
        </div>

        {/* Synopsis */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4" /> Synopsis
          </label>
          <textarea
            rows="4"
            value={animeData.description}
            onChange={(e) =>
              setAnimeData({ ...animeData, description: e.target.value })
            }
            placeholder="A brief description of the anime..."
            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white resize-none transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Year */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Release Year
            </label>
            <input
              type="number"
              value={animeData.year}
              onChange={(e) =>
                setAnimeData({ ...animeData, year: e.target.value })
              }
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white transition-colors"
              required
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4" /> Rating (0-10)
            </label>
            <input
              type="number"
              step="0.01"
              max="10"
              min="0"
              value={animeData.rating}
              onChange={(e) =>
                setAnimeData({ ...animeData, rating: e.target.value })
              }
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white transition-colors"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4" /> Format
            </label>
            <div className="relative">
              <div
                onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm flex items-center justify-between cursor-pointer hover:border-red-500/50 transition-colors text-white"
              >
                <span>
                  {animeData.type === "TV" ? "TV Series" : animeData.type}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isFormatDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              <AnimatePresence>
                {isFormatDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden z-50 shadow-xl"
                  >
                    {["TV", "Movie", "OVA"].map((format) => (
                      <div
                        key={format}
                        onClick={() => {
                          setAnimeData({ ...animeData, type: format })
                          setIsFormatDropdownOpen(false)
                        }}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between
                          ${animeData.type === format ? "bg-red-500/20 text-red-500 font-bold" : "text-neutral-300 hover:bg-white/5"}
                        `}
                      >
                        {format === "TV" ? "TV Series" : format}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Cover Banner URL
            </label>
            <input
              type="url"
              value={animeData.cover}
              onChange={(e) =>
                setAnimeData({ ...animeData, cover: e.target.value })
              }
              placeholder="https://..."
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white transition-colors"
              required
            />
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Thumbnail URL
            </label>
            <input
              type="url"
              value={animeData.thumbnail}
              onChange={(e) =>
                setAnimeData({ ...animeData, thumbnail: e.target.value })
              }
              placeholder="https://..."
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4" /> YouTube Trailer URL (Optional)
          </label>
          <input
            type="url"
            value={animeData.trailerUrl}
            onChange={(e) =>
              setAnimeData({ ...animeData, trailerUrl: e.target.value })
            }
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-red-500 text-white transition-colors"
          />
        </div>

        <div className="pt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>Create Series</>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
