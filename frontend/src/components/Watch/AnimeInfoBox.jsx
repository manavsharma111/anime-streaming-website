import React from "react"
import ExpandableText from "../common/animation/ExpandableText"
import { getImageUrl } from "../../utils/image"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { addToWishlist, deleteWishlist } from "../../redux/slice/wishlistSlice"
import { Heart, MessageSquare, Mic, Play, Plus } from "lucide-react"
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

  const handleWatchClick = () => {
    if (location.pathname.includes("/watch/")) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      if (anime?.episodes && anime.episodes.length > 0) {
        navigate(`/watch/${anime.episodes[0]._id || anime.episodes[0]}`, {
          state: { anime, episode: anime.episodes[0] },
        })
      } else {
        toast.error("No episodes available to watch yet")
      }
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Poster */}
        <div className="w-full md:w-[200px] flex-shrink-0">
          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
            <img
              src={getImageUrl(anime?.cover || anime?.thumbnail)}
              alt={anime?.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-col flex-grow text-sm text-neutral-400 font-medium">
          <div className="flex flex-col gap-2 mb-4">
            <h1 className="text-3xl font-black text-[#a67cff] leading-tight">
              {anime?.title}
            </h1>

            <div className="flex items-center gap-2 text-[11px] font-bold mt-1">
              <span className="border border-white/20 text-neutral-300 px-1.5 py-0.5 rounded-sm">
                PG-13
              </span>
              <span className="border border-white/20 text-neutral-300 px-1.5 py-0.5 rounded-sm">
                HD
              </span>
              <span className="bg-[#a67cff] text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <MessageSquare size={12} className="fill-current" /> {anime?.episodes?.length || "??"}
              </span>
              <span className="bg-[#e4ca67] text-black px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <Mic size={12} className="fill-current" /> {anime?.episodes?.length || "??"}
              </span>
              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-sm">
                ?
              </span>
            </div>
          </div>

          <ExpandableText text={anime?.description} />

          <div className="flex flex-col gap-1.5 text-sm mt-4">
            {anime?.otherNames && anime.otherNames.length > 0 && (
              <div>
                <span className="text-neutral-500 mr-2">Other names:</span>
                <span className="text-neutral-200">{anime.otherNames.join(", ")}</span>
              </div>
            )}
            <div>
              <span className="text-neutral-500 mr-2">Scores:</span>
              <span className="text-neutral-200">{anime?.rating || "N/A"}</span>
            </div>
            <div>
              <span className="text-neutral-500 mr-2">Aired:</span>
              <span className="text-neutral-200">{anime?.year || "N/A"}</span>
            </div>
            <div>
              <span className="text-neutral-500 mr-2">Duration:</span>
              <span className="text-neutral-200">{anime?.duration || "24 min"}</span>
            </div>
            <div>
              <span className="text-neutral-500 mr-2">Status:</span>
              <span className="text-neutral-200 capitalize">
                {anime?.status || "Completed"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 mr-2">Genre:</span>
              <span>
                {anime?.genres
                  ? [
                      ...new Set(
                        anime?.genres
                          .flatMap((g) => g.split(",").map((s) => s.trim()))
                          .filter(Boolean),
                      ),
                    ].map((g, i, arr) => (
                      <span key={i}>
                        <span className="text-[#a67cff] hover:underline cursor-pointer transition-colors">
                          {g}
                        </span>
                        {i < arr.length - 1 && <span className="text-neutral-200">, </span>}
                      </span>
                    ))
                  : <span className="text-neutral-200">N/A</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleWatchClick}
              className="flex-grow max-w-[200px] flex items-center justify-center gap-2 bg-[#a0a0a0] hover:bg-[#b0b0b0] text-black font-bold py-2.5 rounded-full transition-colors"
            >
              <Play size={18} className="fill-current" /> Watch
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
                isInWishlist
                  ? "bg-[#f33767]/20 text-[#f33767] border border-[#f33767]/50"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isInWishlist ? <Heart size={20} fill="#f33767" /> : <Plus size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section Placeholder */}
      {/* <div className="w-full mt-6 bg-[#110e16] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 text-neutral-400 text-xs font-bold rounded-lg cursor-pointer">Anime</span>
            <span className="px-3 py-1 bg-[#6c5ce7] text-white text-xs font-bold rounded-lg cursor-pointer">Episode SUB</span>
          </div>
        </div>
        <div className="p-12 flex items-center justify-center">
          <button className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-bold rounded-lg transition-colors border border-white/10">
            Load comments
          </button>
        </div>
      </div> */}
    </div>
  )
}
