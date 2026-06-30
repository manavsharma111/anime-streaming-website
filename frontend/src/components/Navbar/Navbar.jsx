import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Search, Heart, User, Flame, Bell } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import AuthDropdown from "../Auth/Auth"
import NotificationDropdown from "./Notifications/NotificationDropdown"
import { useSelector } from "react-redux"

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  // { id: 'trending', label: 'Trending', icon: Flame, path: '/trending' },
  { id: "explore", label: "Explore", icon: Search, path: "/search" },
  { id: "wishlist", label: "Watchlist", icon: Heart, path: "/wishlist" },
  { id: "notifications", label: "Notifications", icon: Bell, path: null },
  { id: "user", label: "Profile", icon: User, path: null },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const { notifications } = useSelector((state) => state.auth)
  const prevTab = useRef("home")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    const handleScroll = () => setIsScrolled(window.scrollY > 50)

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleTabClick = (item) => {
    if (item.id === "user") {
      setDropdownOpen(!dropdownOpen)
      setNotifDropdownOpen(false)
      return
    }
    if (item.id === "notifications") {
      setNotifDropdownOpen(!notifDropdownOpen)
      setDropdownOpen(false)
      return
    }
    if (item.id === "search") {
      setActiveTab(item.id)
      return // Do not navigate immediately, let them type
    }

    prevTab.current = item.id
    setActiveTab(item.id)
    if (item.path) navigate(item.path)
    setDropdownOpen(false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const desktopMouseLeave = () => {
    setActiveTab(prevTab.current)
    setDropdownOpen(false)
    setNotifDropdownOpen(false)
  }

  const getPillActive = (id) => activeTab === id

  return (
    <>
      <AnimatePresence>
        {dropdownOpen && isMobile && (
          <motion.div
            key="mob-backdrop"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onPointerDown={() => {
              setActiveTab(prevTab.current)
              setDropdownOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed z-50 select-none flex items-center justify-center w-full pointer-events-none"
        initial={false}
        animate={{
          top: isMobile ? "auto" : isScrolled ? 24 : 0,
          bottom: isMobile ? 0 : "auto",
          padding: 0,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          layout
          initial={false}
          animate={
            !isMobile
              ? {
                  borderRadius: isScrolled ? "9999px" : "0px",
                  backgroundColor: isScrolled
                    ? "rgba(17,14,22,0.6)"
                    : "rgba(17,14,22,0.3)",
                  borderColor: isScrolled
                    ? "rgba(255,255,255,0.05)"
                    : "transparent",
                  borderWidth: isScrolled ? "1px" : "0px",
                  boxShadow: isScrolled
                    ? "0 10px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)"
                    : "none",
                  backdropFilter: "blur(24px)",
                }
              : {
                  borderRadius: "0px",
                  backgroundColor: "rgba(17,14,22,0.6)",
                  borderColor: "transparent",
                  borderWidth: "0px",
                  borderTopWidth: "1px",
                  backdropFilter: "blur(24px)",
                  boxShadow: "none",
                }
          }
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center pointer-events-auto"
          style={{
            width: isMobile ? "100%" : isScrolled ? "fit-content" : "100%",
            padding: isMobile ? "12px 8px" : isScrolled ? "6px" : "12px 32px",
            maxWidth: !isMobile && !isScrolled ? "100%" : "none",
            justifyContent: isMobile
              ? "space-evenly"
              : isScrolled
                ? "center"
                : "space-between",
          }}
        >
          {/* PC Logo - Static in normal, absolute in scrolled */}
          {!isMobile && (
            <AnimatePresence>
              {!isScrolled && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex justify-start"
                >
                  <div className="text-xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#f33767] to-[#ff7eb3] font-mono drop-shadow-[0_0_10px_rgba(243,55,103,0.5)]">
                    ANIME
                    <span className="text-white drop-shadow-md">STREAM</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Actual Navbar Navigation Component */}
          <motion.nav
            layout
            onMouseLeave={isMobile ? undefined : desktopMouseLeave}
            className={`flex items-center gap-1 relative ${!isMobile && !isScrolled ? "flex-none justify-center" : ""}`}
          >
            {navItems.map((item) => {
              const isLit = getPillActive(item.id)
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item)}
                  onMouseEnter={() => {
                    if (!isMobile) {
                      setActiveTab(item.id)
                      if (item.id === "user") {
                        setDropdownOpen(true)
                        setNotifDropdownOpen(false)
                      } else if (item.id === "notifications") {
                        setNotifDropdownOpen(true)
                        setDropdownOpen(false)
                      } else {
                        setDropdownOpen(false)
                        setNotifDropdownOpen(false)
                      }
                    }
                  }}
                  className="focus:outline-none"
                >
                  <motion.div
                    whileHover={!isMobile ? { scale: 1.05 } : {}}
                    whileTap={!isMobile ? { scale: 0.95 } : {}}
                    className={`relative flex items-center gap-2 transition-all duration-300 ease-out z-10
                    ${isMobile ? "flex-col p-2 w-16" : "px-4 py-2.5 rounded-full overflow-hidden group cursor-pointer"}
                    ${isLit && isMobile ? "-translate-y-2" : ""}
                  `}
                  >
                    {/* Background highlight for active tab */}
                    {isLit && !isMobile && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-gradient-to-r from-[#f33767]/20 to-[#ff7eb3]/10 border border-[#f33767]/50 rounded-full shadow-[0_0_20px_rgba(243,55,103,0.3)]"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      />
                    )}

                    <motion.div
                      animate={isLit && !isMobile ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon
                        size={isMobile ? 22 : 18}
                        className={`relative z-10 transition-colors duration-300
                        ${isLit ? "text-[#f33767] drop-shadow-[0_0_8px_rgba(243,55,103,0.8)]" : "text-neutral-400 group-hover:text-white"}
                      `}
                      />
                      {item.id === "notifications" &&
                        notifications.filter((n) => !n.read).length > 0 && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#f33767] border-2 border-[#110e16] rounded-full z-20"></span>
                        )}
                    </motion.div>

                    {/* Desktop Label / Input */}
                    {!isMobile && (
                      <motion.div
                        initial={false}
                        animate={{
                          width: !isScrolled || isLit ? "auto" : 0,
                          opacity: !isScrolled || isLit ? 1 : 0,
                        }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-widest font-mono text-white drop-shadow-md flex items-center"
                      >
                        {item.id === "search" && isLit ? (
                          <form
                            onSubmit={handleSearchSubmit}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search anime..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-transparent border-none outline-none text-white placeholder:text-white/50 w-32 font-bold tracking-wider"
                            />
                          </form>
                        ) : (
                          item.id !== "search" && (
                            <span className="relative z-10 group-hover:text-white transition-colors">
                              {item.label}
                            </span>
                          )
                        )}
                      </motion.div>
                    )}

                    {/* Mobile Label */}
                    {isMobile && (
                      <span
                        className={`text-[10px] font-bold mt-1 transition-all duration-300
                      ${isLit ? "text-[#f33767] opacity-100" : "text-neutral-500 opacity-0 -translate-y-2"}
                    `}
                      >
                        {item.label}
                      </span>
                    )}
                  </motion.div>
                </button>
              )
            })}

            {/* Surprise Me Button (Desktop Only for now) */}
            {!isMobile && isScrolled && (
              <button
                className="ml-4 px-5 py-2.5 bg-gradient-to-r from-[#f33767] to-[#ff7eb3] hover:to-[#f33767] text-white text-xs font-black uppercase tracking-[0.15em] font-mono rounded-full shadow-[0_0_20px_rgba(243,55,103,0.4)] transition-all transform hover:scale-105 active:scale-95 border border-white/20"
                onClick={() => navigate("/search?surprise=true")}
              >
                Surprise Me!
              </button>
            )}

            {/* Auth Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={
                    isMobile
                      ? { y: "100%" }
                      : { opacity: 0, y: 15, scale: 0.95 }
                  }
                  animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={
                    isMobile
                      ? { y: "100%" }
                      : { opacity: 0, y: 15, scale: 0.95 }
                  }
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className={[
                    "pointer-events-auto z-50",
                    isMobile
                      ? "fixed bottom-0 left-0 right-0 w-full rounded-t-[2.5rem] pb-8 pt-4 px-4 bg-neutral-950/95 backdrop-blur-2xl border border-neutral-800 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                      : "absolute top-full right-0 pt-4 w-[380px]",
                  ].join(" ")}
                >
                  <div
                    className={
                      !isMobile
                        ? "bg-neutral-950/95 backdrop-blur-2xl border border-neutral-800 shadow-[0_15px_40px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden"
                        : "h-full"
                    }
                  >
                    {isMobile && (
                      <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mb-5" />
                    )}
                    <div className="relative">
                      <AuthDropdown />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notification Dropdown */}
            <div className="absolute top-full right-16">
              <NotificationDropdown
                isOpen={notifDropdownOpen}
                onClose={() => setNotifDropdownOpen(false)}
              />
            </div>
          </motion.nav>

          {/* Right side items for Unscrolled Desktop Navbar */}
          {!isMobile && !isScrolled && (
            <div className="flex-1 flex items-center justify-end gap-4 relative z-50">
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-[#f33767] to-[#ff7eb3] hover:to-[#f33767] text-white text-xs font-black uppercase tracking-[0.15em] font-mono rounded-full shadow-[0_0_20px_rgba(243,55,103,0.4)] transition-all transform hover:scale-105 active:scale-95 border border-white/20"
                onClick={() => navigate("/search?surprise=true")}
              >
                Surprise Me!
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
