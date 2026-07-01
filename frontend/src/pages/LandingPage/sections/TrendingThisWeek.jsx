import React, { useState } from "react"
import { motion } from "framer-motion"
import { Star, PlayCircle } from "lucide-react"

const fallbackAnime = [
  {
    title: "Solo Leveling",
    img: "https://images.wallpapersden.com/image/download/solo-leveling-anime-art_bWtpZmuUmZqaraWkpJRobWllrWdma2U.jpg",
    rating: 8.7,
    ep: 12,
    genre: "Action",
  },
  {
    title: "Demon Slayer",
    img: "https://images.wallpapersden.com/image/download/demon-slayer-kimetsu-no-yaiba-hd_bGlpZWeUmZqaraWkpJRobWllrWdma2U.jpg",
    rating: 8.9,
    ep: 26,
    genre: "Action",
  },
  {
    title: "Your Name",
    img: "https://images.wallpapersden.com/image/download/your-name-anime-movie_bGlma2eUmZqaraWkpJRobWllrWdma2U.jpg",
    rating: 8.9,
    ep: 1,
    genre: "Romance",
  },
  {
    title: "Jujutsu Kaisen",
    img: "https://images.wallpapersden.com/image/download/jujutsu-kaisen-satoru-gojo-hd_bWtpZ26UmZqaraWkpJRobWllrWdma2U.jpg",
    rating: 8.7,
    ep: 24,
    genre: "Action",
  },
  {
    title: "Chainsaw Man",
    img: "https://images.wallpapersden.com/image/download/makima-chainsaw-man-4k_bWpmZmyUmZqaraWkpJRobWllrWdma2U.jpg",
    rating: 8.2,
    ep: 12,
    genre: "Action",
  },
]

export default function TrendingThisWeek({ animeList = [], loading }) {
  const [hoveredIndex, setHoveredIndex] = useState(0)

  const displayList =
    !loading && animeList.length > 0
      ? animeList.slice(0, 5).map((a) => ({
          title: a.title_english || a.title,
          img:
            a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url,
          rating: a.score || "N/A",
          ep: a.episodes || "?",
          genre: a.genres?.[0]?.name || "Anime",
        }))
      : fallbackAnime

  return (
    <section className="py-12 md:py-16 bg-[#050505] relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12 md:mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Trending Now
            </h2>
            <p className="text-neutral-400 text-lg md:text-xl font-medium">
              The most watched anime right now.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[70vh] md:h-[600px] gap-3 md:gap-4 w-full">
          {displayList.map((anime, index) => {
            const isActive = hoveredIndex === index
            return (
              <motion.div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() => setHoveredIndex(index)}
                layout
                initial={false}
                animate={{
                  flex: isActive ? 8 : 1,
                }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="relative overflow-hidden rounded-3xl cursor-pointer border border-white/10 group min-h-[80px]"
              >
                <img
                  src={anime.img}
                  alt={anime.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500 ${isActive ? "opacity-80" : "opacity-50"}`}
                />
                <div
                  className={`absolute inset-0 bg-black transition-opacity duration-500 ${isActive ? "opacity-0" : "opacity-40 group-hover:opacity-20"}`}
                />

                {/* Vertical title when collapsed (Desktop) */}
                <div
                  className="absolute inset-0 hidden md:flex items-end justify-center pb-12 transition-opacity duration-300"
                  style={{ opacity: isActive ? 0 : 1 }}
                >
                  <h3 className="text-white font-bold text-xl whitespace-nowrap -rotate-90 origin-bottom transform translate-y-16 tracking-widest uppercase">
                    {anime.title.length > 20
                      ? anime.title.slice(0, 20) + "..."
                      : anime.title}
                  </h3>
                </div>

                {/* Content when expanded */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.4, delay: isActive ? 0.2 : 0 }}
                  className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end pointer-events-none"
                >
                  <div className="flex items-center gap-2 mb-4 bg-black/60 w-max px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-white font-bold text-sm">
                      {anime.rating}
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-none drop-shadow-2xl">
                    {anime.title}
                  </h3>

                  <div className="flex items-center gap-3 text-sm font-bold text-neutral-200">
                    <span className="bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-wide">
                      {anime.genre}
                    </span>
                    <span className="bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md uppercase tracking-wide">
                      {anime.ep} Episodes
                    </span>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100 pointer-events-auto">
                    <div className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.6)] backdrop-blur-md hover:scale-110 transition-transform">
                      <PlayCircle size={36} className="text-white ml-1" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
