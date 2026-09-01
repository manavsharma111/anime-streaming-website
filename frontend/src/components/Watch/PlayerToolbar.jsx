import React from "react"
import {
  Maximize,
  Moon,
  FastForward,
  PlayCircle,
  Users,
  SkipBack,
  SkipForward,
  Flag,
  Server
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

  const servers = [
    { id: 1, name: "FAST" },
    { id: 2, name: "ANI" },
    { id: 3, name: "ANI 2" },
    { id: 4, name: "HD-2" },
    { id: 5, name: "HD-3" },
    { id: 6, name: "HD-4" },
    { id: 7, name: "HD-5" },
  ];

  return (
    <div className="flex flex-col bg-[#13151a]">
      {/* Top Action Bar */}
      <div className="w-full px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-neutral-400 border-b border-white/5">
        
        {/* Left/Main Actions */}
        <div className="flex items-center gap-6 flex-wrap">
          <button
            onClick={() => setIsFocused(!isFocused)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Maximize size={14} /> Expand
          </button>

          <button
            onClick={() => setIsFocused(!isFocused)}
            className={`flex items-center gap-1.5 transition-colors ${isFocused ? "text-[#f33767]" : "hover:text-white"}`}
          >
            <Moon size={14} /> Focus
          </button>

          <button
            onClick={() => setAutoNext(!autoNext)}
            className={`flex items-center gap-1.5 transition-colors ${autoNext ? "text-[#e25c3d]" : "hover:text-white"}`}
          >
            <FastForward size={14} fill={autoNext ? "currentColor" : "none"} /> AutoNext
          </button>

          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`flex items-center gap-1.5 transition-colors ${autoPlay ? "text-white" : "hover:text-white"}`}
          >
            <PlayCircle size={14} /> AutoPlay
          </button>

          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Users size={14} /> W2G
          </button>

          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className={`flex items-center gap-1.5 transition-all ${currentIndex > 0 ? "hover:text-white" : "opacity-50 cursor-not-allowed"}`}
          >
            <SkipBack size={14} /> Prev
          </button>

          <button
            onClick={handleNext}
            disabled={
              currentIndex < 0 || currentIndex >= episodesList.length - 1
            }
            className={`flex items-center gap-1.5 transition-all ${currentIndex >= 0 && currentIndex < episodesList.length - 1 ? "hover:text-white" : "opacity-50 cursor-not-allowed"}`}
          >
            <SkipForward size={14} /> Next
          </button>

          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Flag size={14} /> Report
          </button>
        </div>
      </div>

      {/* Server Selection Area */}
      <div className="w-full p-5 flex flex-col md:flex-row gap-6 justify-between items-start bg-[#16181e] rounded-b-xl">
        <div className="flex flex-col gap-2 max-w-sm">
          <p className="text-[13px] text-white font-medium">
            You are watching <span className="font-bold">Episode {episode?.episodeNumber || "N/A"}</span>
          </p>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            If the current server is not working, please try switching to other servers.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 mb-1 justify-end w-full">
             <span className="text-[10px] font-bold text-[#e25c3d] border border-[#e25c3d] px-1 rounded-sm">CC</span>
             <span className="text-[11px] font-bold text-white">Soft Sub</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5 justify-end">
            {servers.map(server => (
              <button
                key={server.id}
                onClick={() => setActiveServer(server.id)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${
                  activeServer === server.id
                    ? "bg-[#3edc76] text-black"
                    : "bg-white/10 text-neutral-400 hover:bg-white/20 hover:text-white"
                }`}
              >
                {server.name}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold rounded-md transition-colors border border-white/10 mt-1">
            <Server size={12} className="text-[#3edc76]" />
            ANI Servers <span className="bg-[#3edc76] text-black rounded-full w-4 h-4 flex items-center justify-center text-[9px]">1</span>
          </button>
        </div>
      </div>

    </div>
  )
}
