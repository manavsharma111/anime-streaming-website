import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import StarRating from "./StarRating"
import { User, Calendar, Trash2, MessageCircle, Send } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import {
  deleteReviewAsync,
  addReplyAsync,
} from "../../../redux/slice/reviewSlice"
import ReplyItem from "./Replies/ReplyItem"

const ReviewList = ({ reviews = [] }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [visibleCount, setVisibleCount] = useState(3)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now()
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now()
    return dateB - dateA
  })
  const visibleReviews = sortedReviews.slice(0, visibleCount)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3)
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-[#110e16] border border-white/5 rounded-3xl shadow-xl">
        <h3 className="text-white font-black uppercase tracking-widest mb-2">
          No Reviews Yet
        </h3>
        <p className="text-neutral-500 text-sm">
          Be the first to share your thoughts on this anime!
        </p>
      </div>
    )
  }

  const handleDelete = (reviewId) => {
    dispatch(deleteReviewAsync(reviewId))
  }

  const handleAddReply = async (reviewId) => {
    if (!replyText.trim()) return
    setIsSubmitting(true)
    await dispatch(addReplyAsync({ reviewId, comment: replyText }))
    setIsSubmitting(false)
    setReplyText("")
    setReplyingTo(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <AnimatePresence>
        {visibleReviews.map((review) => {
          const isOwner =
            user &&
            review.user &&
            (user.id === review.user._id || user._id === review.user._id)

          return (
            <motion.div
              key={review._id}
              variants={itemVariants}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-[#110e16] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors relative shadow-lg"
            >
              {/* Ownership Actions */}
              {isOwner && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pr-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1721] rounded-full border border-white/10 flex items-center justify-center text-neutral-400 overflow-hidden">
                    {review.user?.avatar ? (
                      <img
                        src={review.user.avatar}
                        className="w-full h-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      {review.user?.username || "Anonymous User"}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                      <Calendar size={12} />
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <StarRating rating={review.rating} readonly size={16} />
              </div>

              <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                {review.comment}
              </p>

              {/* Replies Section */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle size={12} /> {review.replies?.length || 0}{" "}
                    Replies
                  </span>
                  {user && (
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === review._id ? null : review._id,
                        )
                      }
                      className="text-xs font-bold text-[#f33767] hover:text-white transition-colors"
                    >
                      {replyingTo === review._id ? "Cancel" : "Reply"}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {replyingTo === review._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="flex items-start gap-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 bg-[#1a1721] border border-white/10 rounded-xl p-3 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-[#f33767] transition-colors resize-none h-12"
                        ></textarea>
                        <button
                          onClick={() => handleAddReply(review._id)}
                          disabled={!replyText.trim() || isSubmitting}
                          className="bg-[#f33767] text-white p-3 rounded-xl hover:bg-transparent border border-[#f33767] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {review.replies && review.replies.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {review.replies.map((reply) => (
                      <ReplyItem
                        key={reply._id}
                        reply={reply}
                        reviewId={review._id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {(visibleCount < sortedReviews.length || visibleCount > 3) && (
        <div className="flex justify-center gap-4 mt-8">
          {visibleCount < sortedReviews.length && (
            <button
              onClick={handleLoadMore}
              className="text-xs font-bold uppercase tracking-widest text-white border border-white/10 hover:border-[#f33767] hover:text-[#f33767] px-6 py-2.5 rounded-full transition-colors"
            >
              Load More Reviews
            </button>
          )}
          {visibleCount > 3 && (
            <button
              onClick={() => setVisibleCount(3)}
              className="text-xs font-bold uppercase tracking-widest text-neutral-400 border border-white/10 hover:border-neutral-500 hover:text-white px-6 py-2.5 rounded-full transition-colors"
            >
              Show Less Reviews
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default ReviewList
