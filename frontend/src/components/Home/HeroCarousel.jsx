import React from "react"
import { useNavigate } from "react-router-dom"
import { Play, Info } from "lucide-react"
import { getImageUrl } from "../../utils/image"
import HoverAccordion from "../common/animation/HoverAccordion"

export default function HeroCarousel({ animes }) {
  const navigate = useNavigate()

  // Guard against missing animes prop
  const heroAnimes = animes?.slice(0, 5) || []

  if (!heroAnimes.length)
    return (
      <div className="w-full h-[300px] md:h-[450px] bg-[#110e16] animate-pulse flex items-center justify-center rounded-2xl border border-white/5">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#f33767] rounded-full animate-spin"></div>
      </div>
    )

  return (
    <HoverAccordion
      items={heroAnimes}
      keyExtractor={(item) => item._id}
      renderBackground={(anime, isActive) => (
        <>
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={getImageUrl(anime.cover || anime.thumbnail)}
              alt={anime.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Gradients */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "bg-gradient-to-t from-[#0e0b12] via-[#0e0b12]/60 to-transparent" : "bg-black/60 hover:bg-black/40"}`}
          />

          {/* Dark gradient for text readability (only when active) */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-[#0e0b12]/90 via-[#0e0b12]/60 to-transparent w-full md:w-3/4 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}
          />
        </>
      )}
      renderCollapsed={(anime) => (
        <div className="rotate-[-90deg] whitespace-nowrap text-white font-black tracking-widest text-xs md:text-sm drop-shadow-md">
          {anime.title.length > 20
            ? anime.title.substring(0, 20) + "..."
            : anime.title}
        </div>
      )}
      renderExpanded={(anime) => (
        <div className="p-4 md:p-8 w-full">
          <div className="max-w-2xl">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span className="bg-[#f33767] text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded shadow-[0_0_15px_rgba(243,55,103,0.3)] tracking-wider uppercase">
                {anime.type || "TV"}
              </span>
              <span className="bg-white/10 border border-white/20 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded backdrop-blur-md">
                {anime.ageRating || "16+"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-3 tracking-tighter leading-[1.1] drop-shadow-2xl line-clamp-2">
              {anime.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-neutral-300 mb-2 md:mb-4 drop-shadow-md">
              <span className="text-yellow-400">★ {anime.rating || "N/A"}</span>
              <span className="w-1 h-1 bg-neutral-600 rounded-full" />
              <span>{anime.year || "2024"}</span>
              <span className="w-1 h-1 bg-neutral-600 rounded-full" />
              <span>{anime.episodes?.length || 0} Episodes</span>
            </div>

            {/* Description */}
            <p className="hidden md:block text-xs md:text-sm text-neutral-300 mb-6 line-clamp-2 md:line-clamp-3 font-medium leading-relaxed max-w-xl">
              {anime.description?.replace(/<[^>]*>?/gm, "") ||
                "A breathtaking anime adventure awaits you. Watch the latest episodes in premium quality exclusively on our platform."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(`/anime/${anime._id}`)}
                className="bg-[#f33767] hover:bg-transparent border border-[#f33767] text-white font-black uppercase tracking-widest text-xs md:text-sm py-2 px-4 md:py-3 md:px-6 rounded-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(243,55,103,0.3)] group"
              >
                <Play
                  size={16}
                  className="fill-white group-hover:scale-110 transition-transform"
                />
                Watch Now
              </button>

              <button
                onClick={() => navigate(`/anime/${anime._id}`)}
                className="bg-[#1a1721]/80 hover:bg-[#1a1721] backdrop-blur-md border border-white/10 text-white font-bold uppercase tracking-widest text-xs md:text-sm py-2 px-4 md:py-3 md:px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <Info size={16} />
                Details
              </button>
            </div>
          </div>
        </div>
      )}
    />
  )
}
