import React from "react"
import { Link } from "react-router-dom"
import { Play, Captions, Mic } from "lucide-react"
import { getImageUrl } from "../../utils/image"
import { motion } from "framer-motion"
import AnimeHoverCard from "../AnimeHoverCard"

const AnimeCard = ({ anime }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-2 relative group"
    >
      <Link
        to={`/anime/${anime._id}`}
        className="relative group cursor-pointer aspect-[3/4] rounded-xl overflow-hidden bg-[#110e16] border border-white/5 block shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <img
          src={getImageUrl(anime.cover || anime.thumbnail)}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
        />

        {/* Top Right: Type (TV/Movie) */}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-[#f33767]/90 backdrop-blur-md text-white text-[10px] font-black tracking-wider px-2 py-1 rounded-md shadow-lg uppercase">
            {anime.type || "TV"}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b12] via-[#0e0b12]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

        {/* Bottom Tags: Ep / Sub / Dub */}
        <div className="absolute bottom-2 left-2 flex items-center z-10 font-black text-[10px] tracking-wider rounded-md overflow-hidden shadow-lg border border-white/10">
          <div className="flex items-center gap-1 bg-[#8b5cf6]/90 backdrop-blur-md text-white px-1.5 py-0.5">
            <Captions size={10} />
            <span>{anime.totalEpisodes || anime.episodes?.length || "?"}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#eab308]/90 backdrop-blur-md text-white px-1.5 py-0.5 border-l border-white/20">
            <Mic size={10} />
            <span>{anime.totalEpisodes || anime.episodes?.length || "?"}</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md text-neutral-300 px-1.5 py-0.5 border-l border-white/20">
            {anime.totalEpisodes || anime.episodes?.length || "?"}
          </div>
        </div>

        {/* Play Icon Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
          <div className="w-14 h-14 rounded-full bg-[#f33767]/90 backdrop-blur-md flex items-center justify-center pl-1 text-white border border-white/20 shadow-[0_0_20px_rgba(243,55,103,0.5)] scale-75 group-hover:scale-100 transition-transform duration-500 delay-100">
            <Play size={24} className="fill-white" />
          </div>
        </div>
      </Link>

      {/* Title */}
      <Link to={`/anime/${anime._id}`}>
        <h3 className="text-sm font-bold text-neutral-200 line-clamp-1 group-hover:text-[#f33767] transition-colors mt-1">
          {anime.title}
        </h3>
      </Link>

      <AnimeHoverCard anime={anime} position="right" />
    </motion.div>
  )
}

export default AnimeCard
