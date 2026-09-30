import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../../redux/slice/authSlice"
import { Link } from "react-router-dom"
import { LogOut, LayoutDashboard, User, Crown } from "lucide-react"
import { toast } from "react-hot-toast"
import { getImageUrl } from "../../utils/image"

export default function AuthDropdown() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const handleGoogleLogin = () => {
    // Redirect to backend Google Auth route
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api"
    const currentPath = window.location.pathname + window.location.search
    window.location.href = `${backendUrl}/auth/google?returnTo=${encodeURIComponent(currentPath)}`
  }

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success("Logged out successfully!")
    } catch (error) {
      toast.error("Failed to log out!")
    }
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col p-2">
        <div className="flex items-center gap-3 mb-5 mt-2 px-1">
          {user.avatar ? (
            <img
              src={getImageUrl(user.avatar)}
              alt="Profile"
              className="w-11 h-11 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white font-black text-lg">
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-white font-bold text-[15px] truncate leading-tight mb-0.5">
              {user.role === "admin" ? "Admin" : user.username || "User"}
            </h3>
            <p className="text-[11px] text-neutral-400 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to="/profile"
            onClick={() => document.dispatchEvent(new Event("click"))}
            className="w-full py-2.5 px-4 bg-[#231216] hover:bg-[#2a151a] text-[#f33767] rounded-xl font-semibold transition-all active:scale-95 flex justify-center items-center gap-2 whitespace-nowrap"
          >
            <User size={18} />
            My Profile
          </Link>

          <Link
            to="/pricing"
            onClick={() => document.dispatchEvent(new Event("click"))}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#f33767] to-purple-600 hover:from-[#e02e5a] hover:to-purple-500 text-white rounded-xl font-bold transition-all active:scale-95 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(243,55,103,0.3)] whitespace-nowrap"
          >
            <Crown size={18} />
            {user.isPremium ? "Manage Subscription" : "Get Premium"}
          </Link>

          {user.role === "admin" && (
            <Link
              to="/admin"
              className="w-full py-2.5 px-4 bg-[#231216] hover:bg-[#2a151a] text-red-500 rounded-xl font-semibold transition-all active:scale-95 flex justify-center items-center gap-2 whitespace-nowrap"
            >
              <LayoutDashboard size={18} />
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-[#1a1a1a] hover:bg-[#222222] text-[#f33767] rounded-xl font-semibold transition-all active:scale-95 flex justify-center items-center gap-2 whitespace-nowrap"
          >
            <LogOut size={18} />
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

      {/* Local Development Fake Login Button */}
      {import.meta.env.DEV && (
        <button
          onClick={async () => {
            try {
              const { default: api } = await import("../../services/api")
              await api.post("/auth/dev-login")
              toast.success("Logged in successfully (Dev Mode)!")
              setTimeout(() => {
                window.location.href = window.location.pathname + "?login=success"
              }, 500)
            } catch (error) {
              toast.error("Dev login failed!")
              console.error(error)
            }
          }}
          className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-transform active:scale-95 flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          🛠️ Dev Login (Local Only)
        </button>
      )}
    </div>
  )
}
