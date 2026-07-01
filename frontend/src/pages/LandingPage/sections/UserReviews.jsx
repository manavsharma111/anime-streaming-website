import React from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

const reviews = [
  {
    name: "Ken Kaneki",
    role: "Otaku",
    text: "The streaming quality is insane. 4K without any buffering even on release days.",
  },
  {
    name: "Levi Ackerman",
    role: "Watcher",
    text: "Cleanest UI out of all streaming platforms. Makes finding new shows effortless.",
  },
  {
    name: "Gojo Satoru",
    role: "Fanatic",
    text: "Dual audio switching is seamless. I can finally watch raw episodes the moment they air.",
  },
  {
    name: "Makima",
    role: "Binge Watcher",
    text: "The recommendations actually make sense. Found 3 hidden gems this week alone.",
  },
  {
    name: "Zoro Roronoa",
    role: "Wanderer",
    text: "I never get lost finding my watchlist anymore. Everything is exactly where it needs to be.",
  },
  {
    name: "Killua Zoldyck",
    role: "Speedrunner",
    text: "Lightning fast servers and an incredible catalog. What more do you need?",
  },
]

export default function UserReviews() {
  return (
    <section className="py-32 bg-[#050505] relative z-10 border-t border-white/5 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mb-20 text-center md:text-left">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
          Loved by millions.
        </h2>
        <p className="text-xl text-neutral-400">
          Join a global community of anime fans streaming for free.
        </p>
      </div>

      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{ x: [0, -2400] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          className="flex gap-6 px-6 items-center"
        >
          {[...reviews, ...reviews, ...reviews].map((review, i) => (
            <div
              key={i}
              className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/[0.04] transition-colors w-[350px] md:w-[450px] flex-shrink-0"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className="text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <p className="text-lg text-white mb-8 leading-relaxed whitespace-normal">
                "{review.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-purple-600 border border-white/20 flex items-center justify-center font-black text-white">
                  {review.name[0]}
                </div>
                <div>
                  <div className="text-white font-bold">{review.name}</div>
                  <div className="text-sm text-neutral-500">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
