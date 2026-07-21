import React from "react"
import { Link } from "react-router-dom"
import { Captions, Play, Mic, Heart, Plus } from "lucide-react"
import { getImageUrl } from "../utils/image"
import { useDispatch, useSelector } from "react-redux"
import { addToWishlist, deleteWishlist } from "../redux/slice/wishlistSlice"
import toast from "react-hot-toast"

export default function AnimeHoverCard({ anime, position = "right" }) {
  const dispatch = useDispatch()
  const { wishlist } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (!anime) return null

  const wishlistItem = wishlist?.find(
    (item) => item.anime?._id === anime._id || item.anime === anime._id,
  )
  const isInWishlist = !!wishlistItem

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error("Please login to add to watchlist")
      return
    }

    if (isInWishlist) {
      dispatch(deleteWishlist(wishlistItem._id))
        .unwrap()
        .then(() => toast.success("Removed from watchlist"))
        .catch((err) => toast.error(err.message || "Failed to remove"))
    } else {
      dispatch(addToWishlist({ anime: anime._id }))
        .unwrap()
        .then(() => toast.success("Added to watchlist"))
        .catch((err) => toast.error(err.message || "Failed to add"))
    }
  }

  // Determine classes based on position
  const positionClasses =
    position === "right"
      ? "left-full top-1/2 -translate-y-1/2 ml-2 before:absolute before:-left-4 before:top-0 before:h-full before:w-5"
      : "right-full top-1/2 -translate-y-1/2 mr-2 before:absolute before:-right-4 before:top-0 before:h-full before:w-5"

  return (
    <div
      className={`hidden lg:flex flex-col absolute z-50 w-[300px] bg-[#1c1c1c] rounded-xl border border-white/10 p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 delay-300 ${positionClasses}`}
    >
      <img
        src={getImageUrl(anime.posterPath || anime.cover || anime.thumbnail)}
        className="w-full h-32 object-cover rounded-xl mb-3"
        alt={anime.title}
      />
      <h4 className="text-lg font-bold text-white mb-2 leading-tight">
        {anime.title}
      </h4>

      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-3">
        <span className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-sm text-white">
          PG-13
        </span>
        <span className="bg-[#8b5cf6] text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1">
          <Captions size={10} />
          {anime.totalEpisodes || anime.episodes?.length || "?"}
        </span>
        <span className="bg-[#eab308] text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1">
          <Mic size={10} />
          {anime.totalEpisodes || anime.episodes?.length || "?"}
        </span>
      </div>

      <p className="text-xs text-neutral-400 line-clamp-4 mb-4 leading-relaxed">
        {anime.description || "No description available for this anime."}
      </p>

      <div className="flex flex-col gap-1.5 text-[11px] text-neutral-400 mb-4">
        <div>
          <span className="text-neutral-500 mr-1">Scores:</span>{" "}
          <span className="text-white">
            {anime.rating ? `${anime.rating}/10` : "N/A"}
          </span>
        </div>
        <div>
          <span className="text-neutral-500 mr-1">Year:</span>{" "}
          <span className="text-white">{anime.year || "2024"}</span>
        </div>
        <div>
          <span className="text-neutral-500 mr-1">Status:</span>{" "}
          <span className="text-white capitalize">
            {anime.status || "Completed"}
          </span>
        </div>
        <div>
          <span className="text-neutral-500 mr-1">Genre:</span>
          <span className="text-[#6c5ce7]">
            {anime.genres
              ? [
                  ...new Set(
                    anime.genres
                      .flatMap((g) => g.split(",").map((s) => s.trim()))
                      .filter(Boolean),
                  ),
                ].join(", ")
              : "Action, Drama"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={`/anime/${anime._id}`}
          className="flex-grow py-2.5 bg-[#dcdcdc] hover:bg-white text-black text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors pointer-events-auto"
        >
          <Play size={16} className="fill-black" /> Watch
        </Link>
        <button
          onClick={handleWishlistToggle}
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors pointer-events-auto ${
            isInWishlist
              ? "bg-[#f33767]/20 text-[#f33767] border border-[#f33767]/50"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isInWishlist ? <Heart size={18} fill="#f33767" /> : <Plus size={20} />}
        </button>
      </div>
    </div>
  )
}
