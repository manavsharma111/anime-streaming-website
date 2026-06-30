import React from "react"
import {
  Monitor,
  Settings,
  Scissors,
  SkipBack,
  SkipForward,
  Play,
  Download,
  Bookmark,
  Heart,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { addToWishlist, deleteWishlist } from "../../redux/slice/wishlistSlice"
import toast from "react-hot-toast"

export default function PlayerToolbar({
  isFocused,
  setIsFocused,
  autoNext,
  setAutoNext,
  autoPlay,
  setAutoPlay,
  autoSkip,
  setAutoSkip,
  activeServer,
  setActiveServer,
  handlePrev,
  handleNext,
  currentIndex,
  episodesList,
  episode,
  backendUrl,
}) {
  const dispatch = useDispatch()
  const { wishlist } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useSelector((state) => state.auth)

  // Check if anime is in wishlist
  const wishlistItem = wishlist?.find(
    (item) =>
      item.anime?._id === episode?.anime?._id ||
      item.anime === episode?.anime?._id,
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
      dispatch(addToWishlist({ anime: episode?.anime?._id }))
        .unwrap()
        .then(() => toast.success("Added to watchlist"))
        .catch((err) => toast.error(err.message || "Failed to add"))
    }
  }

  return (
    <div className="flex flex-col bg-[#1c1c1c]">
      {/* Top Action Bar */}
      <div className="w-full px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-neutral-400">
        {/* Left Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setIsFocused(!isFocused)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Monitor size={14} /> Expand
          </button>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={() => setAutoPlay(!autoPlay)}
              className="accent-[#6c5ce7]"
            />
            Auto Play
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={autoNext}
              onChange={() => setAutoNext(!autoNext)}
              className="accent-[#6c5ce7]"
            />
            Auto Next
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#ffc107] hover:text-[#ffca28] transition-colors">
            <input
              type="checkbox"
              checked={autoSkip}
              onChange={() => setAutoSkip(!autoSkip)}
              className="accent-[#ffc107]"
            />
            Auto Skip
          </label>

          <button
            onClick={() => setIsFocused(!isFocused)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            Light
          </button>

          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className={`flex items-center gap-1 transition-all ${currentIndex > 0 ? "hover:text-white" : "opacity-50 cursor-not-allowed"}`}
          >
            <SkipBack size={14} /> Prev
          </button>

          <button
            onClick={handleNext}
            disabled={
              currentIndex < 0 || currentIndex >= episodesList.length - 1
            }
            className={`flex items-center gap-1 transition-all ${currentIndex >= 0 && currentIndex < episodesList.length - 1 ? "hover:text-white" : "opacity-50 cursor-not-allowed"}`}
          >
            <SkipForward size={14} /> Next
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            Report
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`flex items-center gap-1.5 transition-colors ${isInWishlist ? "text-[#f33767]" : "hover:text-white"}`}
          >
            <Heart size={14} fill={isInWishlist ? "#f33767" : "transparent"} />
            {isInWishlist ? "In Watchlist" : "Add to list"}
          </button>
        </div>
      </div>

      {/* Server Selector Area */}
      <div className="w-full bg-[#111] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs text-neutral-400 leading-relaxed max-w-md">
          You're watching{" "}
          <span className="text-[#6c5ce7] font-bold">
            Episode {episode.episodeNumber}
          </span>
          . <br />
          If current servers doesn't work, please try other servers beside.
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1c1c1c] text-neutral-300 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1">
            <Settings size={14} /> SUB
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveServer(1)}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${
                activeServer === 1
                  ? "bg-[#6c5ce7] text-white"
                  : "bg-[#1c1c1c] text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${activeServer === 1 ? "bg-white" : "bg-neutral-600"}`}
              ></span>
              Vidplay
            </button>
            <button
              onClick={() => setActiveServer(2)}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${
                activeServer === 2
                  ? "bg-[#6c5ce7] text-white"
                  : "bg-[#1c1c1c] text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${activeServer === 2 ? "bg-white" : "bg-neutral-600"}`}
              ></span>
              MyCloud
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
