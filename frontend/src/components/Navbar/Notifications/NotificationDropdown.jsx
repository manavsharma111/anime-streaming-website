import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Trash2, CheckCircle, ExternalLink } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchNotifications,
  markNotificationReadAsync,
  deleteNotificationAsync,
} from "../../../redux/Slice/authSlice"
import { useNavigate } from "react-router-dom"

export default function NotificationDropdown({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { notifications } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications())
    }
  }, [isOpen, dispatch])

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationReadAsync(notification._id))
    }
    onClose()
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    dispatch(deleteNotificationAsync(id))
  }

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation()
    dispatch(markNotificationReadAsync(id))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-12 w-80 bg-[#110e16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
            <h3 className="text-white font-bold text-sm">Notifications</h3>
            <span className="bg-[#f33767] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.read).length} New
            </span>
          </div>

          <div className="max-h-[350px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center text-neutral-500">
                <Bell size={32} className="mb-3 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`relative p-4 border-b border-white/5 cursor-pointer transition-colors flex gap-3 group ${notif.read ? "bg-transparent hover:bg-white/5" : "bg-[#f33767]/5 hover:bg-[#f33767]/10"}`}
                  >
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#f33767]"></div>
                    )}
                    <div
                      className={`mt-1 rounded-full p-1.5 ${notif.read ? "bg-neutral-800 text-neutral-400" : "bg-[#f33767] text-white"}`}
                    >
                      <Bell size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${notif.read ? "text-neutral-300" : "text-white font-semibold"}`}
                      >
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity items-end shrink-0 pl-2">
                      <button
                        onClick={(e) => handleDelete(e, notif._id)}
                        className="text-neutral-500 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                      {!notif.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notif._id)}
                          className="text-neutral-500 hover:text-emerald-500 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
