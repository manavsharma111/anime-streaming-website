import React from "react"
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#f33767] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/home" replace />
  }

  return children
}

export default ProtectedRoute
