import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, Star } from "lucide-react"
import { getImageUrl } from "../../utils/image"
import { useSelector } from "react-redux"

export default function TopAnime() {
  const [activeTab, setActiveTab] = useState("Day")
  const tabs = ["Day", "Week", "Month"]
  const { animeList } = useSelector((state) => state.anime)

  // Use real data, take top 10
  const topAnimes = animeList ? animeList.slice(0, 10) : []

  return (
    <div className="bg-[#110e16] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#f33767]/10 blur-[40px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
          <span className="w-1.5 h-6 bg-[#f33767] rounded-full inline-block shadow-[0_0_10px_rgba(243,55,103,0.5)]"></span>
          Top 10 Series
        </h3>
      </div>

      <div className="flex bg-[#1a1721] rounded-xl overflow-hidden mb-6 border border-white/5 relative z-10 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${
              activeTab === tab
                ? "bg-[#f33767] text-white shadow-[0_0_15px_rgba(243,55,103,0.3)]"
                : "text-neutral-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        {topAnimes.map((anime, index) => {
          return (
            <Link
              key={anime._id}
              to={`/anime/${anime._id}`}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-[#1a1721] transition-all group border border-transparent hover:border-white/5"
            >
              {/* Giant Hollow Number */}
              <div
                className="w-12 text-5xl font-black italic flex justify-center items-center shrink-0"
                style={{
                  WebkitTextStroke: index < 3 ? "1.5px #f33767" : "1px #666",
                  color: "transparent",
                  opacity: index < 3 ? 1 : 0.5,
                }}
              >
                {index + 1}
              </div>

              {/* Horizontal Mini Card */}
              <div className="flex bg-[#16131c] rounded-lg border border-white/5 group-hover:border-white/10 w-full overflow-hidden h-[72px] shadow-md transition-colors">
                <img
                  src={getImageUrl(anime.cover || anime.thumbnail)}
                  alt={anime.title}
                  className="w-[50px] h-full object-cover shrink-0"
                />
                <div className="flex flex-col justify-center px-3 min-w-0 flex-1">
                  <h4 className="text-[12px] font-bold text-neutral-200 truncate group-hover:text-[#f33767] transition-colors mb-1.5">
                    {anime.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black tracking-wider uppercase">
                    <span className="flex items-center gap-0.5 bg-[#8b5cf6]/20 text-[#c4b5fd] px-1 py-0.5 rounded border border-[#8b5cf6]/30">
                      <span className="text-[10px]">CC</span>{" "}
                      {anime.totalEpisodes || anime.episodes?.length || "?"}
                    </span>
                    <span className="flex items-center gap-0.5 bg-[#eab308]/20 text-[#fde047] px-1 py-0.5 rounded border border-[#eab308]/30">
                      <span className="text-[10px]">🎤</span>{" "}
                      {anime.totalEpisodes || anime.episodes?.length || "?"}
                    </span>
                    <span className="bg-white/10 text-neutral-400 px-1 py-0.5 rounded">
                      {anime.type || "TV"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
