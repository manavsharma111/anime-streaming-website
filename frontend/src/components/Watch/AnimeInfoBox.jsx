import React, { useState } from "react"
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Dropdown options
  const listStatuses = ["Watching", "Completed", "Planning", "Paused", "Dropped"]
  const currentStatus = wishlistItem?.status || "Add to List"

  const handleStatusChange = (status) => {
    setIsDropdownOpen(false)
    if (!isAuthenticated) {
      toast.error("Please login to manage your list")
      return
    }
    
    if (status === "Remove") {
      if (isInWishlist) {
        dispatch(deleteWishlist(wishlistItem._id))
          .unwrap()
          .then(() => toast.success("Removed from list"))
          .catch((err) => toast.error(err.message || "Failed to remove"))
      }
      return
    }

    if (isInWishlist) {
      dispatch(updateWishlistStatus({ id: wishlistItem._id, status }))
        .unwrap()
        .then(() => toast.success(`Moved to ${status}`))
        .catch((err) => toast.error(err.message || "Failed to update"))
    } else {
      dispatch(addToWishlist({ anime: anime._id, status }))
        .unwrap()
        .then(() => toast.success(`Added to ${status}`))
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
        {/* Left Side: Thumbnail/Cover */}
        <div className="w-full md:w-[200px] flex-shrink-0">
          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
            <img
              src={getImageUrl(anime?.thumbnail || anime?.cover)}
              alt={anime?.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleWatchClick}
                className="w-14 h-14 bg-[#f33767] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(243,55,103,0.5)] transform scale-90 group-hover:scale-100 transition-transform duration-300"
              >
                <Play size={24} className="text-white fill-white ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-col flex-grow text-sm text-neutral-400 font-medium">
          <div className="flex flex-col gap-2 mb-4">
            <h1 className="text-3xl font-black text-[#a67cff] leading-tight">
              {anime?.title}
            </h1>
            
            {anime?.otherNames && anime.otherNames.length > 0 && (
              <p className="text-xs text-neutral-500 italic mt-0.5 mb-2 line-clamp-1">
                {anime.otherNames.join(", ")}
              </p>
            )}

            <div className="flex items-center gap-2 text-[11px] font-bold mt-1">
              <span className="border border-white/20 text-neutral-300 px-1.5 py-0.5 rounded-sm">
                PG-13
              </span>
              <span className="border border-white/20 text-neutral-300 px-1.5 py-0.5 rounded-sm">
                HD
              </span>
              <span className="bg-[#a67cff] text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <MessageSquare size={12} className="fill-current" />{" "}
                {anime?.episodes?.length || "??"}
              </span>
              <span className="bg-[#e4ca67] text-black px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <Mic size={12} className="fill-current" />{" "}
                {anime?.episodes?.length || "??"}
              </span>
              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-sm">
                ?
              </span>
            </div>
          </div>

          <ExpandableText text={anime?.description} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
            {/* Left Column */}
            <div className="flex flex-col gap-2">
              {anime?.type && (
                <div>
                  <span className="text-neutral-500 mr-2">Type:</span>
                  <span className="text-neutral-200">{anime.type}</span>
                </div>
              )}
              {anime?.country && (
                <div>
                  <span className="text-neutral-500 mr-2">Country:</span>
                  <span className="text-neutral-200">{anime.country}</span>
                </div>
              )}
              <div>
                <span className="text-neutral-500 mr-2">Premiered:</span>
                <span className="text-neutral-200">{anime?.year || "N/A"}</span>
              </div>
              <div>
                <span className="text-neutral-500 mr-2">Status:</span>
                <span className="text-[#a67cff] capitalize">
                  {anime?.status || "Completed"}
                </span>
              </div>
              {anime?.source && (
                <div>
                  <span className="text-neutral-500 mr-2">Source:</span>
                  <span className="text-neutral-200">{anime.source}</span>
                </div>
              )}
              <div className="col-span-1 md:col-span-2 mt-1">
                <span className="text-neutral-500 mr-2">Genres:</span>
                <span className="text-[#a67cff]">
                  {anime?.genres ? (
                    [
                      ...new Set(
                        anime?.genres
                          .flatMap((g) => g.split(","))
                          .map((g) => g.trim()),
                      ),
                    ].join(", ")
                  ) : (
                    "Unknown"
                  )}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-neutral-500 mr-2">Scores:</span>
                <span className="text-neutral-200">
                  {anime?.rating != null ? `${anime.rating} (MAL)` : ""}
                  {anime?.rating != null && anime?.platformRating != null ? " • " : ""}
                  {anime?.platformRating != null ? `${anime.platformRating} (Users)` : ""}
                  {anime?.rating == null && anime?.platformRating == null && "N/A"}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 mr-2">Duration:</span>
                <span className="text-neutral-200">
                  {anime?.duration || "24 min"}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 mr-2">Episodes:</span>
                <span className="text-neutral-200">
                  {anime?.episodes?.length || anime?.totalEpisodes || "??"}
                </span>
              </div>
              {anime?.studios && (
                <div>
                  <span className="text-neutral-500 mr-2">Studios:</span>
                  <span className="text-[#a67cff]">{anime.studios}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
            <button
              onClick={handleWatchClick}
              className="flex-grow sm:flex-grow-0 sm:w-[200px] flex items-center justify-center gap-2 bg-[#a0a0a0] hover:bg-[#b0b0b0] text-black font-bold py-2.5 rounded-full transition-colors"
            >
              <Play size={18} className="fill-current" /> Watch
            </button>
            
            {/* List Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full sm:w-48 flex items-center justify-center gap-2 py-2.5 rounded-full font-bold transition-colors ${
                  isInWishlist
                    ? "bg-[#f33767] text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {isInWishlist ? <Heart size={16} fill="white" /> : <Plus size={18} />}
                {currentStatus}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-full sm:w-48 bg-[#1a1721] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  {listStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        currentStatus === status 
                          ? "bg-white/10 text-[#f33767] font-bold" 
                          : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  {isInWishlist && (
                    <button
                      onClick={() => handleStatusChange("Remove")}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 font-bold transition-colors border-t border-white/5"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
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
