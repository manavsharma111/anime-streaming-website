import React from "react"
import ExpandableText from "../common/animation/ExpandableText"
import { getImageUrl } from "../../utils/image"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { addToWishlist, deleteWishlist } from "../../redux/slice/wishlistSlice"
import { Heart, MessageSquare, Mic, Play, Plus, Bookmark, Star } from "lucide-react"
import toast from "react-hot-toast"

export default function AnimeInfoBox({ anime }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { wishlist } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (!anime) return null

  // Check if anime is in wishlist
  const wishlistItem = wishlist?.find(
    (item) => item.anime?._id === anime._id || item.anime === anime._id,
  )
  const isInWishlist = !!wishlistItem

  const handleWishlistToggle = () => {
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

  return (
    <div className="w-full flex flex-col bg-[#13151a] rounded-xl overflow-hidden shadow-2xl border border-white/5">
      {/* Top Banner / Cover Fade */}
      <div className="w-full h-[280px] relative">
        <img
          src={getImageUrl(anime?.cover || anime?.thumbnail)}
          alt={anime?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13151a] via-[#13151a]/50 to-transparent" />
      </div>

      <div className="flex flex-col px-5 pb-6 -mt-10 relative z-10">
        <h1 className="text-xl font-bold text-white text-center leading-tight mb-2 shadow-sm">
          {anime?.title}
        </h1>
        
        {anime?.otherNames && anime.otherNames.length > 0 && (
          <p className="text-xs text-neutral-400 text-center mb-4">
            {anime.otherNames[0]}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 text-[10px] font-bold mb-5 flex-wrap">
          <span className="border border-[#e25c3d] bg-[#e25c3d]/10 text-[#e25c3d] px-1.5 py-0.5 rounded-sm">
            PG-13
          </span>
          <span className="border border-white/20 text-neutral-300 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
            <span className="text-[#e25c3d]">CC</span> {anime?.episodes?.length || "??"}
          </span>
          <span className="border border-white/20 text-[#3edc76] px-1.5 py-0.5 rounded-sm flex items-center gap-1">
            <Mic size={10} className="fill-current" /> {anime?.episodes?.length || "??"}
          </span>
          <span className="text-neutral-400">TV</span>
        </div>

        <div className="text-xs text-neutral-300 font-medium leading-relaxed mb-6 italic opacity-80 text-center">
          <ExpandableText text={anime?.description} />
        </div>

        <div className="flex flex-col gap-2 text-xs mb-6">
          <div className="flex">
            <span className="text-neutral-500 w-[70px] shrink-0">Country:</span>
            <span className="text-neutral-200">Japan</span>
          </div>
          <div className="flex">
            <span className="text-neutral-500 w-[70px] shrink-0">Genres:</span>
            <span className="text-neutral-200">
              {anime?.genres ? (
                anime?.genres
                  .flatMap((g) => g.split(",").map((s) => s.trim()))
                  .filter(Boolean)
                  .join(", ")
              ) : "N/A"}
            </span>
          </div>
          <div className="flex">
            <span className="text-neutral-500 w-[70px] shrink-0">Episodes:</span>
            <span className="text-neutral-200">{anime?.episodes?.length || "??"}</span>
          </div>
          <div className="flex">
            <span className="text-neutral-500 w-[70px] shrink-0">Duration:</span>
            <span className="text-neutral-200">{anime?.duration || "24 min"}</span>
          </div>
          <div className="flex">
            <span className="text-neutral-500 w-[70px] shrink-0">Status:</span>
            <span className="text-neutral-200 capitalize">{anime?.status || "Completed"}</span>
          </div>
          <div className="flex">
            <span className="text-neutral-500 w-[70px] shrink-0">MAL:</span>
            <span className="text-neutral-200">{anime?.rating || "8.2"}</span>
          </div>
        </div>

        <button
          onClick={handleWishlistToggle}
          className={`flex items-center gap-2 text-xs font-bold transition-colors ${isInWishlist ? "text-[#e25c3d]" : "text-neutral-400 hover:text-white"}`}
        >
          <Bookmark size={14} fill={isInWishlist ? "#e25c3d" : "transparent"} /> 
          {isInWishlist ? "Bookmarked" : "Bookmark"}
        </button>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center">
          <p className="text-[#e25c3d] font-bold text-sm mb-2">How'd you rate this anime?</p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-lg">{anime?.rating || "8.2"}</span>
            <div className="flex items-center gap-1 text-[#e25c3d]">
              <Star size={16} fill="currentColor" stroke="none" />
              <Star size={16} fill="currentColor" stroke="none" />
              <Star size={16} fill="currentColor" stroke="none" />
              <Star size={16} fill="currentColor" stroke="none" />
              <Star size={16} fill="#333" stroke="none" className="text-[#333]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
