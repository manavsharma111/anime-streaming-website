import React from "react"
import { User, Trash2, Calendar } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { deleteReplyAsync } from "../../../../redux/slice/reviewSlice"
import { motion } from "framer-motion"

export default function ReplyItem({ reply, reviewId }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const isOwner =
    user &&
    reply.user &&
    (user.id === reply.user._id ||
      user._id === reply.user._id ||
      user.role === "admin")

  const handleDelete = () => {
    dispatch(deleteReplyAsync({ reviewId, replyId: reply._id }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative pl-8 mt-4 border-l-2 border-white/10"
    >
      <div className="bg-[#1a1721]/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors relative">
        {isOwner && (
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 text-neutral-500 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-[#1a1721] rounded-full border border-white/10 flex items-center justify-center text-neutral-400 overflow-hidden">
            {reply.user?.avatar ? (
              <img
                src={reply.user.avatar}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            ) : (
              <User size={12} />
            )}
          </div>
          <div>
            <h5 className="text-white font-bold text-xs">
              {reply.user?.username || "Anonymous User"}
            </h5>
            <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
              <Calendar size={10} />
              {new Date(reply.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
        <p className="text-neutral-300 text-xs leading-relaxed">
          {reply.comment}
        </p>
      </div>
    </motion.div>
  )
}
