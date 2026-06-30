import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../../redux/Slice/authSlice"
import { Link } from "react-router-dom"
import { LogOut, LayoutDashboard, User } from "lucide-react"

export default function AuthDropdown() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const handleGoogleLogin = () => {
    // Redirect to backend Google Auth route
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api"
    window.location.href = `${backendUrl}/auth/google`
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col p-2">
        <div className="flex items-center gap-3 mb-5 mt-2 px-2">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-neutral-700 shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white font-bold border border-neutral-600 shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-white font-bold text-[15px] truncate">
              {user.name || "User"}
            </h3>
            <p className="text-[11px] text-neutral-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to="/profile"
            onClick={() => document.dispatchEvent(new Event("click"))} // Optional: close dropdown hack or just rely on react-router
            className="w-full py-2.5 px-4 bg-[#f33767]/10 hover:bg-[#f33767]/20 border border-[#f33767]/20 text-[#f33767] rounded-xl font-medium transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <User size={16} />
            My Profile
          </Link>
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="w-full py-2.5 px-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-500 rounded-xl font-medium transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              <LayoutDashboard size={16} />
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800/80 text-red-400 hover:text-red-300 rounded-xl font-medium transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-2">
      <div className="text-center mb-6 mt-2">
        <h3 className="text-white font-black text-xl tracking-tight">
          Welcome Back
        </h3>
        <p className="text-xs text-neutral-400 mt-1.5 font-medium">
          Sign in to sync your watchlist & history
        </p>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-3.5 px-4 bg-white hover:bg-neutral-200 text-black rounded-xl font-bold transition-transform active:scale-95 flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="22"
          height="22"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </div>
  )
}
