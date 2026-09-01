import React, { useState } from "react"
import { Search, ChevronDown, ChevronLeft, ChevronRight, Hash, Mic, List, LayoutGrid } from "lucide-react"

export default function EpisodeListSidebar({
  searchEpisode,
  setSearchEpisode,
  episodesList,
  episode,
  handleSelectEpisode,
}) {
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'

  return (
    <aside className="w-full flex flex-col xl:sticky xl:top-[100px] h-[600px] xl:h-[calc(100vh-140px)] bg-[#13151a] p-4 rounded-xl border border-white/5 font-sans">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white tracking-wide">Episodes</h2>
        
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex items-center bg-[#1f222b] rounded-md px-2 py-1.5 h-8 w-24">
            <Hash size={14} className="text-neutral-500 mr-1" />
            <input
              type="text"
              placeholder="Find"
              value={searchEpisode}
              onChange={(e) => setSearchEpisode(e.target.value)}
              className="w-full h-full bg-transparent border-none text-xs text-white focus:outline-none placeholder:text-neutral-500"
            />
          </div>

          {/* CC & Mic */}
          <div className="flex items-center justify-center gap-1.5 bg-[#1f222b] rounded-md px-2 py-1.5 h-8">
            <span className="text-[10px] font-bold text-[#e25c3d]">CC</span>
            <Mic size={12} className="text-[#3edc76]" />
          </div>

          {/* Toggle List/Grid */}
          <button 
            onClick={() => setViewMode(prev => prev === "list" ? "grid" : "list")}
            className="flex items-center justify-center bg-[#1f222b] hover:bg-white/10 rounded-md h-8 w-8 text-neutral-400 transition-colors"
          >
            {viewMode === "list" ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
        </div>
      </div>

      {/* Range Selector */}
      <div className="flex items-center justify-between bg-[#1f222b] rounded-md px-3 py-2.5 mb-4">
        <button className="text-neutral-600 hover:text-white transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1 text-sm text-neutral-300 font-medium cursor-pointer hover:text-white transition-colors">
          001-024 <ChevronDown size={14} className="text-neutral-500" />
        </div>
        <button className="text-neutral-600 hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Episodes Container */}
      <div className={`overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#333_transparent] ${
        viewMode === "grid" 
          ? "grid grid-cols-6 gap-2 content-start" 
          : "flex flex-col gap-2"
      }`}>
        {episodesList
          .filter((ep) =>
            searchEpisode
              ? ep.episodeNumber?.toString().includes(searchEpisode)
              : true,
          )
          .map((ep, idx) => {
            const isActive = (ep._id || ep) === episode?._id;
            const bgClass = isActive 
              ? "bg-[#e25c3d] text-white shadow-md shadow-[#e25c3d]/20" 
              : "bg-[#181a24] text-white hover:bg-[#252836]";

            if (viewMode === "grid") {
              return (
                <button
                  key={ep._id || idx}
                  onClick={() => handleSelectEpisode(ep)}
                  className={`aspect-square flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${bgClass}`}
                  title={ep.title || `Episode ${ep.episodeNumber}`}
                >
                  {ep.episodeNumber}
                </button>
              );
            }

            return (
              <button
                key={ep._id || idx}
                onClick={() => handleSelectEpisode(ep)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm text-left transition-colors ${bgClass}`}
                title={ep.title || `Episode ${ep.episodeNumber}`}
              >
                <span className={`w-8 font-semibold shrink-0 ${isActive ? "text-white/90" : "text-white"}`}>
                  {ep.episodeNumber}
                </span>
                <span className="truncate">
                  {ep.title || `Episode ${ep.episodeNumber}`}
                </span>
              </button>
            )
          })}
      </div>
    </aside>
  )
}
