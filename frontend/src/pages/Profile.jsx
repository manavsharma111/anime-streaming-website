import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import subscriptionService from "../services/subscriptionService"
import {
  checkAuth,
  fetchNotifications,
  markNotificationReadAsync,
  deleteNotificationAsync,
} from "../redux/slice/authSlice"
import {
  getWatchHistory,
  deleteAllHistory,
  deleteHistory,
} from "../redux/slice/historySlice"
import {
  User,
  Settings,
  Clock,
  Trash2,
  Edit2,
  Play,
  LogOut,
  Loader,
  Crown,
  Bell,
} from "lucide-react"
import { Navigate, Link } from "react-router-dom"
import { getImageUrl } from "../utils/image"
import axiosInstance from "../services/api"
import toast from "react-hot-toast"

export default function Profile() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)
  const { history, isLoading: historyLoading } = useSelector(
    (state) => state.history,
  )

  const [activeTab, setActiveTab] = useState("history")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    avatar: "",
    avatarFile: null,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWatchHistory())
      dispatch(fetchNotifications())
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: prev.username || user.username || "",
        avatar: prev.avatar || user.avatar || "",
      }))
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0b12] flex items-center justify-center">
        <Loader size={48} className="animate-spin text-[#f33767]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      let dataToSubmit = formData
      const config = {}

      if (formData.avatarFile) {
        dataToSubmit = new FormData()
        dataToSubmit.append("username", formData.username)
        dataToSubmit.append("avatarFile", formData.avatarFile)
        config.headers = { "Content-Type": "multipart/form-data" }
      }

      const res = await axiosInstance.put(
        "/auth/update-profile",
        dataToSubmit,
        config,
      )
      if (res.data.success) {
        toast.success("Profile updated successfully!")
        setIsEditing(false)
        dispatch(checkAuth()) // Refresh user data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClearHistory = () => {
    if (
      window.confirm("Are you sure you want to clear all your watch history?")
    ) {
      dispatch(deleteAllHistory())
    }
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout")
      window.location.href = "/"
    } catch (error) {
      console.error(error)
    }
  }

  const handleCancelPlan = async () => {
    try {
      toast.loading("Cancelling plan...", { id: "cancel" })
      await subscriptionService.cancelPlan(user._id)
      toast.success("Plan cancelled successfully!", { id: "cancel" })
      dispatch(checkAuth())
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel plan", {
        id: "cancel",
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0b12] text-white pt-24 pb-32 md:pb-10 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-[#110e16] p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#f33767] mb-4 bg-[#1a1721] flex items-center justify-center relative group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-neutral-500" />
              )}
            </div>
            <h2 className="text-xl font-black mb-1">{user?.username}</h2>
            <p className="text-sm text-neutral-500 mb-4">{user?.email}</p>

            {user?.subscription?.planId &&
              user?.subscription?.status === "active" && (
                <div className="mb-6 flex flex-col items-center gap-2 w-full">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-[#f33767]/20 to-purple-600/20 border border-[#f33767]/30 rounded-full inline-flex items-center gap-2">
                    <Crown size={14} className="text-[#f33767]" />
                    <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f33767] to-purple-500">
                      {user.subscription.planId.name}
                    </span>
                  </div>
                  {user.subscription.endDate && (
                    <div className="text-xs text-neutral-400 font-medium">
                      Time left:{" "}
                      {Math.max(
                        0,
                        Math.ceil(
                          (new Date(user.subscription.endDate) - new Date()) /
                            (1000 * 3600 * 24),
                        ),
                      )}{" "}
                      days
                    </div>
                  )}
                  <button
                    onClick={handleCancelPlan}
                    className="w-full mt-2 py-2 rounded-xl border border-[#f33767]/50 hover:bg-[#f33767]/20 text-[#f33767] transition-colors text-xs font-bold"
                  >
                    Cancel & Refund
                  </button>
                </div>
              )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:border-red-500 hover:text-red-500 transition-colors text-sm font-bold"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="bg-[#110e16] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-3 p-4 border-l-2 transition-colors ${activeTab === "history" ? "border-[#f33767] bg-white/5 text-white" : "border-transparent text-neutral-400 hover:bg-white/5 hover:text-white"}`}
            >
              <Clock size={18} />{" "}
              <span className="font-bold text-sm">Watch History</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 p-4 border-l-2 transition-colors ${activeTab === "settings" ? "border-[#f33767] bg-white/5 text-white" : "border-transparent text-neutral-400 hover:bg-white/5 hover:text-white"}`}
            >
              <Settings size={18} />{" "}
              <span className="font-bold text-sm">Account Settings</span>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 p-4 border-l-2 transition-colors ${activeTab === "notifications" ? "border-[#f33767] bg-white/5 text-white" : "border-transparent text-neutral-400 hover:bg-white/5 hover:text-white"}`}
            >
              <div className="relative">
                <Bell size={18} />
                {user?.notifications?.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f33767] rounded-full"></span>
                )}
              </div>
              <span className="font-bold text-sm">Notifications</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <div className="bg-[#110e16] p-6 sm:p-8 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="text-2xl font-black uppercase tracking-wider">
                  Watch History
                </h3>
                {history?.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                )}
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <Loader size={32} className="animate-spin text-[#f33767]" />
                </div>
              ) : history?.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {history.map((item, index) => {
                    if (!item.anime || !item.episode) return null
                    const progressPercent = item.totalDuration
                      ? (item.watchTime / item.totalDuration) * 100
                      : item.progress

                    return (
                      <div
                        key={`${item._id}-${index}`}
                        className="flex gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group relative overflow-hidden"
                      >
                        <Link
                          to={`/watch/${item.episode._id || item.episode}`}
                          state={{ fetchAnimeId: item.anime._id || item.anime }}
                          className="w-40 sm:w-48 aspect-video rounded-lg overflow-hidden shrink-0 relative"
                        >
                          <img
                            src={getImageUrl(
                              item.anime.cover || item.anime.thumbnail,
                            )}
                            alt={item.anime.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={24} className="text-white fill-white" />
                          </div>

                          {/* Progress bar */}
                          {progressPercent > 0 && (
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/60">
                              <div
                                className="h-full bg-[#f33767]"
                                style={{
                                  width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                                }}
                              ></div>
                            </div>
                          )}
                        </Link>

                        <div className="flex flex-col justify-center flex-1 py-1">
                          <Link
                            to={`/watch/${item.episode._id || item.episode}`}
                            state={{
                              fetchAnimeId: item.anime._id || item.anime,
                            }}
                          >
                            <h4 className="text-base font-bold text-white line-clamp-1 hover:text-[#f33767] transition-colors">
                              {item.anime.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-neutral-400 mt-1">
                            Episode {item.episode.episodeNumber}
                          </p>
                          {item.completed && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 mt-2 bg-green-500/10 px-2 py-1 w-fit rounded">
                              Completed
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => dispatch(deleteHistory(item._id))}
                          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-500/20 text-neutral-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Clock size={48} className="mx-auto text-neutral-600 mb-4" />
                  <h4 className="text-xl font-bold mb-2">No Watch History</h4>
                  <p className="text-neutral-500 text-sm">
                    You haven't watched any anime recently.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="bg-[#110e16] p-6 sm:p-8 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="text-2xl font-black uppercase tracking-wider flex items-center gap-3">
                  <Bell className="text-[#f33767]" /> Notifications
                </h3>
              </div>

              {!user?.notifications || user.notifications.length === 0 ? (
                <div className="text-center py-16">
                  <Bell
                    size={48}
                    className="mx-auto text-neutral-600 mb-4 opacity-20"
                  />
                  <h4 className="text-xl font-bold mb-2">No Notifications</h4>
                  <p className="text-neutral-500 text-sm">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {user.notifications
                    .slice()
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    )
                    .map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() =>
                          !notif.read &&
                          dispatch(markNotificationReadAsync(notif._id))
                        }
                        className={`relative flex gap-4 p-4 rounded-xl transition-colors border group ${notif.read ? "bg-white/5 border-white/5" : "bg-[#f33767]/5 border-[#f33767]/20 cursor-pointer"}`}
                      >
                        {!notif.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#f33767] rounded-l-xl"></div>
                        )}
                        <div
                          className={`mt-1 rounded-full p-2 h-fit ${notif.read ? "bg-neutral-800 text-neutral-400" : "bg-[#f33767] text-white"}`}
                        >
                          <Bell size={16} />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm md:text-base ${notif.read ? "text-neutral-300" : "text-white font-semibold"}`}
                          >
                            {notif.message}
                          </p>
                          <span className="text-xs text-neutral-500 mt-2 block">
                            {new Date(notif.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            dispatch(deleteNotificationAsync(notif._id))
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all h-fit"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="bg-[#110e16] p-6 sm:p-8 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="text-2xl font-black uppercase tracking-wider">
                  Account Settings
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#f33767] hover:text-white transition-colors"
                  >
                    <Edit2 size={14} /> Edit Profile
                  </button>
                )}
              </div>

              <form
                onSubmit={handleUpdateProfile}
                className="max-w-md flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={!isEditing}
                    className="bg-[#1a1721] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f33767] disabled:opacity-50 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Email{" "}
                    <span className="text-neutral-600 lowercase">
                      (cannot be changed)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-[#1a1721] border border-white/5 rounded-xl px-4 py-3 text-neutral-500 focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        avatarFile: e.target.files[0],
                      })
                    }
                    disabled={!isEditing}
                    className="bg-[#1a1721] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f33767] disabled:opacity-50 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f33767] file:text-white hover:file:bg-[#d02050]"
                  />
                  {!formData.avatarFile && user?.avatar && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Leave empty to keep current picture.
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 bg-[#f33767] hover:bg-transparent text-white border border-[#f33767] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(243,55,103,0.3)] hover:shadow-none"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          username: user?.username || "",
                          avatar: user?.avatar || "",
                          avatarFile: null,
                        })
                      }}
                      disabled={isUpdating}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-transparent px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
