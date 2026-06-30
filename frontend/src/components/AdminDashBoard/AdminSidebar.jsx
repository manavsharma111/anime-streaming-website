import React from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Library,
  PlusCircle,
  UploadCloud,
  LogOut,
  Settings,
  Activity,
} from "lucide-react"
import { useDispatch } from "react-redux"
import { logout } from "../../redux/Slice/authSlice"
import { useNavigate } from "react-router-dom"

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "catalog", label: "Catalog", icon: Library },
    { id: "create", label: "Create Anime", icon: PlusCircle },
    { id: "upload", label: "Upload Episode", icon: UploadCloud },
    { id: "queue", label: "Queue Monitor", icon: Activity },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-neutral-950 border-r border-white/5 flex flex-col z-50 pt-[80px] transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex-1 px-4 py-8 overflow-y-auto">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 px-3">
            Dashboard
          </h3>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    if (window.innerWidth < 768) setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-red-500/10 text-red-500"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-red-500" : "text-neutral-500"}`}
                  />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="w-5 h-5 text-neutral-500" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
