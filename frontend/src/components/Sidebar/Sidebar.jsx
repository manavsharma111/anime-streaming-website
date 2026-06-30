import React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  TrendingUp,
  PlaySquare,
  Film,
  List,
  Calendar,
  History,
  Bookmark,
} from "lucide-react"

const sidebarLinks = [
  { label: "Home", path: "/", icon: Home },
  { label: "Trending", path: "/trending", icon: TrendingUp },
  { label: "Action Movies", path: "/movies/action", icon: Film },
  { label: "Series & OVA", path: "/series", icon: PlaySquare },
  { label: "Anime List", path: "/anime-list", icon: List },
  { label: "Schedule", path: "/schedule", icon: Calendar },
  { label: "History", path: "/history", icon: History },
  { label: "Watchlist", path: "/wishlist", icon: Bookmark },
]

const topFranchises = [
  { label: "One Piece", path: "/franchise/one-piece" },
  { label: "Naruto", path: "/franchise/naruto" },
  { label: "Bleach", path: "/franchise/bleach" },
  { label: "Jujutsu Kaisen", path: "/franchise/jjk" },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block overflow-y-auto custom-scrollbar sticky top-[100px] max-h-[calc(100vh-120px)] bg-[#111111] rounded-2xl border border-neutral-800 shadow-xl p-4">
      <div className="flex flex-col gap-1 mb-6">
        <h3 className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-2 px-3">
          Menu
        </h3>
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path
          const Icon = link.icon
          return (
            <Link
              key={link.label}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-500 border border-red-500/30"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-2 px-3">
          Top Franchises
        </h3>
        {topFranchises.map((link) => {
          return (
            <Link
              key={link.label}
              to={link.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[13px] text-neutral-500 hover:text-red-400 hover:bg-neutral-800/50 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              {link.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
