import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Search, Heart, User, Flame, Bell } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import AuthDropdown from "../Auth/Auth"
import NotificationDropdown from "./Notifications/NotificationDropdown"
import { useSelector } from "react-redux"

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/home" },
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

  // Sync active tab with current URL route
  useEffect(() => {
    const currentItem = navItems.find((item) => item.path === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.id)
      prevTab.current = currentItem.id
    } else if (location.pathname === "/" || location.pathname === "/home") {
      setActiveTab("home")
      prevTab.current = "home"
    } else {
      // Clear active tab if route doesn't match any navbar item (e.g., /admin)
      setActiveTab(null)
      prevTab.current = null
    }
  }, [location.pathname])

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
    if (item.path) {
      // Delay navigation slightly so the pill animation can run smoothly at 60fps
      // before React freezes the main thread to render the new page.
      setTimeout(() => {
        navigate(item.path)
      }, 150)
    }
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
            className="fixed inset-0 z-40 bg-black/80 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onPointerDown={() => {
              setActiveTab(prevTab.current)
              setDropdownOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Top Logo */}
      {isMobile && !location.pathname.startsWith("/admin") && (
        <div
          className="absolute top-6 left-0 right-0 z-[60] flex justify-center pointer-events-auto cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="text-xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#f33767] to-[#ff7eb3] font-mono drop-shadow-[0_0_10px_rgba(243,55,103,0.5)]">
            ANIME<span className="text-white drop-shadow-md">STREAM</span>
          </div>
        </div>
      )}

      <motion.div
        className="fixed z-[60] select-none flex items-center justify-center w-full pointer-events-none"
        initial={false}
        animate={{
          top: isMobile ? "auto" : isScrolled ? 24 : 0,
          bottom: isMobile ? 24 : "auto",
          padding: 0,
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      >
        <motion.div
          layout
          initial={false}
          animate={
            !isMobile
              ? {
                  borderRadius: isScrolled ? "9999px" : "0px",
                  backgroundColor: isScrolled
                    ? "rgba(17,14,22,0.7)"
                    : "rgba(17,14,22,0.0)",
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
                  borderRadius: "9999px",
                  backgroundColor: "rgba(10,10,10,0.95)",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderWidth: "1px",
                  backdropFilter: "none",
                  boxShadow: "0 -5px 20px rgba(0,0,0,0.5)",
                }
          }
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className="relative flex items-center justify-center pointer-events-auto"
          style={{
            width: isMobile ? "auto" : isScrolled ? "fit-content" : "100%",
            padding: isMobile ? "8px 12px" : isScrolled ? "6px" : "12px 32px",
            maxWidth: !isMobile && !isScrolled ? "100%" : "none",
            gap: isMobile ? "8px" : "0px",
            justifyContent: isMobile
              ? "center"
              : isScrolled
                ? "center"
                : "space-between",
          }}
        >
          {/* PC Logo - Smoothly collapses on scroll */}
          {!isMobile && (
            <motion.div
              layout
              initial={false}
              animate={{
                flex: isScrolled ? 0 : 1,
                opacity: isScrolled ? 0 : 1,
                paddingRight: isScrolled ? 0 : "2rem",
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="flex justify-start items-center overflow-hidden cursor-pointer whitespace-nowrap pointer-events-auto"
              onClick={() => navigate("/")}
            >
              <div className="text-xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#f33767] to-[#ff7eb3] font-mono drop-shadow-[0_0_10px_rgba(243,55,103,0.5)]">
                ANIME<span className="text-white drop-shadow-md">STREAM</span>
              </div>
            </motion.div>
          )}

          {/* Actual Navbar Navigation Component */}
          <nav
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
                    whileTap={{ scale: 0.9 }}
                    className={`relative flex items-center justify-center gap-2 z-10 cursor-pointer group rounded-full overflow-hidden transition-all duration-300 ease-out
                    ${isMobile ? (isLit ? "px-4 py-2 h-11" : "px-0 w-11 h-11") : "px-4 py-2.5 h-[42px]"}
                  `}
                  >
                    {/* Background highlight for active tab */}
                    {isLit && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-gradient-to-r from-[#f33767]/20 to-[#ff7eb3]/10 border border-[#f33767]/50 rounded-full md:shadow-[0_0_20px_rgba(243,55,103,0.3)]"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      />
                    )}
                    
                    <motion.div
                      animate={isLit ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="relative flex items-center justify-center"
                    >
                      <Icon
                        size={isMobile ? 22 : 18}
                        className={`relative z-10 transition-colors duration-300
                        ${isLit ? "text-[#f33767] md:drop-shadow-[0_0_8px_rgba(243,55,103,0.8)]" : "text-neutral-400 group-hover:text-white"}
                      `}
                      />
                      {item.id === "notifications" &&
                        notifications.filter((n) => !n.read).length > 0 && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#f33767] border-2 border-[#110e16] rounded-full z-20"></span>
                        )}
                    </motion.div>

                    {/* Label / Input (Visible on both Desktop and Mobile when Lit) */}
                    <div
                      className="overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-widest font-mono text-white drop-shadow-md flex items-center transition-all duration-300 ease-out"
                      style={{
                        maxWidth: isLit ? "150px" : "0px",
                        opacity: isLit ? 1 : 0,
                        marginLeft: isLit ? "6px" : "0px",
                      }}
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
                    </div>

                  </motion.div>
                </button>
              )
            })}

            {/* Surprise Me Button (Always attached to nav) */}
            {!isMobile && (
              <button
                className="ml-2 px-5 py-2.5 bg-gradient-to-r from-[#f33767] to-[#ff7eb3] hover:to-[#f33767] text-white text-xs font-black uppercase tracking-[0.15em] font-mono rounded-full shadow-[0_0_20px_rgba(243,55,103,0.4)] transition-all transform hover:scale-105 active:scale-95 border border-white/20 whitespace-nowrap"
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
                  transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.5 }}
                  className={[
                    "pointer-events-auto z-[60]",
                    isMobile
                      ? "fixed bottom-0 left-0 right-0 w-full rounded-t-[2.5rem] pb-8 pt-4 px-4 bg-[#0a0a0a] border-t border-neutral-800 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
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
                isMobile={isMobile}
              />
            </div>
          </nav>

          {/* Right side spacer for Unscrolled Desktop Navbar to keep it centered */}
          {!isMobile && (
            <motion.div
              layout
              initial={false}
              animate={{
                flex: isScrolled ? 0 : 1,
                paddingLeft: isScrolled ? 0 : "2rem",
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="overflow-hidden pointer-events-none"
            />
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
