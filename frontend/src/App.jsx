import React, { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { checkAuth, addSocketNotification } from "./redux/slice/authSlice"
import Navbar from "./components/Navbar/Navbar"
import Home from "./pages/Home"
import AnimeDetails from "./pages/AnimeDetail/AnimeDetails"
import Watch from "./pages/Watch"
import Search from "./pages/Search"
import AdminDashboard from "./pages/AdminDashBoard/AdminDashboard"
import Wishlist from "./pages/WishList/Wishlist"
import Profile from "./pages/Profile"
import LandingPage from "./pages/LandingPage"
import Lenis from "@studio-freight/lenis"
import { Toaster, toast } from "react-hot-toast"
import SmoothScroll from "./components/common/animation/SmoothScroll"
import socketService from "./services/socketService"
import { UploadProvider } from "./context/UploadContext"
import GlobalUploadProgress from "./components/GlobalUploadProgress"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  const dispatch = useDispatch()
  const location = useLocation()

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
        <GlobalUploadProgress />
        <SmoothScroll>
          {location.pathname !== "/" && <Navbar />}

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/anime/:id" element={<AnimeDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watch/:episodeId" element={<Watch />} />

            {/* Protected User Routes */}
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </SmoothScroll>
      </div>
    </UploadProvider>
  )
}
