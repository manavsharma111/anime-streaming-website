import React from "react"
import { Link } from "react-router-dom"
import { Captions, Mic } from "lucide-react"
import { getImageUrl } from "../../utils/image"
import { motion } from "framer-motion"
import AnimeHoverCard from "../AnimeHoverCard"

const AnimeListCard = ({ anime }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 bg-[#110e16]/50 hover:bg-[#1a1721] p-2 rounded-xl transition-colors border border-transparent hover:border-white/5"
    >
      <div className="shrink-0 w-[64px] aspect-[3/4] rounded-lg relative shadow-lg group">
        <Link
          to={`/anime/${anime._id}`}
          className="block w-full h-full overflow-hidden rounded-lg"
        >
          <img
            src={getImageUrl(anime.cover || anime.thumbnail)}
            alt={anime.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        <AnimeHoverCard anime={anime} position="right" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
        <Link to={`/anime/${anime._id}`}>
          <h4 className="text-neutral-200 font-bold text-sm line-clamp-2 leading-tight hover:text-[#f33767] transition-colors pr-2">
            {anime.title}
          </h4>
        </Link>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black tracking-wider mt-0.5">
          {/* CC / Sub */}
          <div className="flex items-center gap-1 bg-[#8b5cf6]/20 text-[#c4b5fd] px-1.5 py-0.5 rounded-md border border-[#8b5cf6]/30 shadow-inner">
            <Captions size={11} className="text-[#a78bfa]" />
            <span>{anime.totalEpisodes || anime.episodes?.length || "?"}</span>
          </div>

          {/* Mic / Dub */}
          <div className="flex items-center gap-1 bg-[#eab308]/20 text-[#fde047] px-1.5 py-0.5 rounded-md border border-[#eab308]/30 shadow-inner">
            <Mic size={11} className="text-[#facc15]" />
            <span>{anime.totalEpisodes || anime.episodes?.length || "?"}</span>
          </div>

          {/* Total Eps */}
          <div className="bg-black/60 text-neutral-300 px-1.5 py-0.5 rounded-sm border border-white/10">
            {anime.totalEpisodes || anime.episodes?.length || "?"}
          </div>

          <div className="flex items-center text-neutral-500 gap-1 ml-1 font-semibold uppercase">
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            <span>{anime.type || "TV"}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            <span>{anime.year || "2026"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AnimeListCard
