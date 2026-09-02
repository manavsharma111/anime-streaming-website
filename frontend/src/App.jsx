import React, { useEffect, Suspense, lazy } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { checkAuth, addSocketNotification } from "./redux/slice/authSlice"
import { getWishlist } from "./redux/slice/wishlistSlice"
import Navbar from "./components/Navbar/Navbar"

// Lazy Load Pages to prevent huge bundle size and navigation lag
const Home = lazy(() => import("./pages/Home"))
const AnimeDetails = lazy(() => import("./pages/AnimeDetail/AnimeDetails"))
const Watch = lazy(() => import("./pages/Watch"))
const Search = lazy(() => import("./pages/Search"))
const AdminDashboard = lazy(() => import("./pages/AdminDashBoard/AdminDashboard"))
const Wishlist = lazy(() => import("./pages/WishList/Wishlist"))
const Profile = lazy(() => import("./pages/Profile"))
const LandingPage = lazy(() => import("./pages/LandingPage"))

import Lenis from "@studio-freight/lenis"
import { Toaster, toast } from "react-hot-toast"
import SmoothScroll from "./components/common/animation/SmoothScroll"
import socketService from "./services/socketService"
import { UploadProvider } from "./context/UploadContext"
import GlobalUploadProgress from "./components/GlobalUploadProgress"
import ProtectedRoute from "./components/ProtectedRoute"
import CustomCursor from "./components/common/animation/CustomCursor"
import { AnimatePresence } from "framer-motion"
import PageTransition from "./components/common/animation/PageTransition"
export default function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWishlist())
    }
  }, [isAuthenticated, dispatch])

  useEffect(() => {
    dispatch(checkAuth())

    // Initialize Socket Connection for Notifications
    socketService.getSocket()

    socketService.onNewNotification((notification) => {
      dispatch(addSocketNotification(notification))
      toast.success(notification.message, {
        icon: "🔔",
        style: {
          background: "#1c1c1c",
          color: "#fff",
          border: "1px solid #f33767",
        },
      })
    })

    return () => {
      socketService.off("new-notification")
    }
  }, [dispatch])

  // Lenis initialization is handled by SmoothScroll.jsx

  // Scroll to top on route change using Lenis if available
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location.pathname])

  return (
    <UploadProvider>
      <div className="min-h-screen bg-[#0a0a0a] antialiased selection:bg-red-500/30 text-white overflow-x-hidden">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1c1c1c",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <CustomCursor />
        <GlobalUploadProgress />
        <SmoothScroll>
          {location.pathname !== "/" && !location.pathname.startsWith("/admin") && <Navbar />}

          <Suspense 
            fallback={
              <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#f33767]/20 border-t-[#f33767] rounded-full animate-spin mb-4" />
                <div className="text-[#f33767] font-black tracking-[0.2em] font-mono text-sm animate-pulse">LOADING...</div>
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/anime/:id" element={<PageTransition><AnimeDetails /></PageTransition>} />
                <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
                <Route path="/watch/:episodeId" element={<PageTransition><Watch /></PageTransition>} />

                {/* Protected User Routes */}
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <PageTransition><Wishlist /></PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <PageTransition><Profile /></PageTransition>
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <PageTransition><AdminDashboard /></PageTransition>
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </SmoothScroll>
      </div>
    </UploadProvider>
  )
}
