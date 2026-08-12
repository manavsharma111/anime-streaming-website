import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Play, Info } from "lucide-react"

const fallbackAnime = [
  {
    title: "Smoking Behind The Super Market",
    img: "https://www.otakupt.com/wp-content/uploads/2026/03/Smoking-Behind-the-Supermarket-with-You-anime-pv-animejapan-2026-screenshot-smoking.jpg",
    rating: 8.7,
    ep: 12,
    genre: "Romance",
  },
  {
    title: "Bungou Stray Dogs",
    img: "https://wallpapercave.com/wp/wp6787215.jpg",
    rating: 8.9,
    ep: 26,
    genre: "Supernatural",
  },
  {
    title: "Your Name",
    img: "https://wallpaperaccess.com/full/2397732.png",
    rating: 8.9,
    ep: 1,
    genre: "Romance",
  },
  {
    title: "Jujutsu Kaisen",
    img: "https://comicbook.com/wp-content/uploads/sites/4/2025/05/Jujutsu-Kaisen-Shibuya-Incident.jpg?resize=2000,1125",
    rating: 8.7,
    ep: 24,
    genre: "Action",
  },
  {
    title: "Chainsaw Man",
    img: "https://comicbook.com/wp-content/uploads/sites/4/2025/09/Chainsaw-Man-Reze-Arc-movie-release-date-us-anime.jpg?resize=425",
    rating: 8.2,
    ep: 12,
    genre: "Action",
  },
]

const gradients = [
  "from-blue-900/80",
  "from-red-900/80",
  "from-purple-900/80",
  "from-green-900/80",
  "from-amber-900/80",
]

export default function FeaturedShowcase({ animeList = [], loading }) {
  const [active, setActive] = useState(0)

  const displayList = fallbackAnime
  // !loading && animeList.length >= 3
  //   ? animeList.slice(0, 3).map((a, i) => ({
  //       id: a.mal_id,
  //       title: a.title_english || a.title,
  //       description: a.synopsis
  //         ? a.synopsis.slice(0, 180) + "..."
  //         : "No description available.",
  //       img:
  //         a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url,
  //       color: gradients[i % gradients.length],
  //     }))
  //   : fallbackAnime

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % displayList.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [displayList.length])

  const item = displayList[active]

  return (
    <section className="relative w-full h-screen min-h-[800px] flex items-center overflow-hidden bg-[#050505] z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover opacity-40 filter blur-sm"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${item.color} via-[#050505]/80 to-[#050505] mix-blend-multiply`}
          />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-6 md:px-12 relative z-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1">
          <motion.div
            key={`content-${active}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-sm font-bold tracking-widest uppercase mb-8">
              Featured Masterpiece
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">
              {item.title}
            </h2>
            <p className="text-lg text-neutral-300 max-w-xl leading-relaxed mb-10">
              {item.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/home">
                <button className="px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-3 hover:scale-105 transition-transform">
                  <Play size={20} className="fill-black" />
                  Watch Now
                </button>
              </Link>
              <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-full flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-md">
                <Info size={20} /> Details
              </button>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end relative h-[500px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${active}`}
              initial={{ opacity: 0, y: 50, rotateY: 20 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              exit={{ opacity: 0, y: -50, rotateY: -20 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="absolute w-[300px] md:w-[400px] h-[450px] md:h-[600px] rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10"
              style={{ perspective: 1000 }}
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {displayList.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-500 ${i === active ? "w-12 bg-white" : "w-2 bg-white/30 hover:bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  )
}
