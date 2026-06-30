import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addReviewAsync } from "../../../redux/slice/reviewSlice"
import StarRating from "./StarRating"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Image as ImageIcon, X, Play } from "lucide-react"

const ReviewForm = ({ animeId }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { loading, error } = useSelector((state) => state.review)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    const result = await dispatch(
      addReviewAsync({
        animeId,
        reviewData: { rating, comment, media: [] },
      }),
    )

    if (result.meta.requestStatus === "fulfilled") {
      setComment("")
      setRating(5)
    }
  }

  const handleGoogleLogin = () => {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api"
    window.location.href = `${backendUrl}/auth/google`
  }

  if (!user) {
    return (
      <div className="bg-[#110e16] border border-white/5 rounded-2xl p-6 text-center shadow-xl">
        <h3 className="text-white font-black uppercase tracking-widest mb-2">
          Write a Review
        </h3>
        <p className="text-neutral-400 text-sm mb-4">
          You must be logged in to share your experience.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="bg-[#f33767] text-white px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-xs border border-[#f33767] hover:bg-transparent transition-colors shadow-[0_0_15px_rgba(243,55,103,0.3)]"
        >
          Log In Now
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#110e16] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-[#f33767]/10 rounded-full blur-3xl -z-10"></div>

      <h3 className="text-white font-black uppercase tracking-widest mb-4">
        Write a Review
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div>
          <label className="block text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">
            Your Rating
          </label>
          <StarRating rating={rating} setRating={setRating} size={28} />
        </div>

        <div>
          <label className="block text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Tell us what you think about this anime..."
            className="w-full bg-[#1a1721] border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-[#f33767] transition-colors resize-none h-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#f33767] text-white border border-[#f33767] hover:bg-transparent px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_15px_rgba(243,55,103,0.3)]"
        >
          {loading ? "Submitting..." : "Submit Review"}
          {!loading && (
            <Send
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          )}
        </button>
      </form>
    </motion.div>
  )
}

export default ReviewForm
