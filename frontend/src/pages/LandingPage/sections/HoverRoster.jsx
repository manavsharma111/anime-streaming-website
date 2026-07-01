import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Premium fallback roster
const roster = [
  { name: "JUJUTSU KAISEN", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop" },
  { name: "ATTACK ON TITAN", img: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1000&auto=format&fit=crop" },
  { name: "CHAINSAW MAN", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop" },
  { name: "DEMON SLAYER", img: "https://images.unsplash.com/photo-1513628253939-010e64ac66cd?q=80&w=1000&auto=format&fit=crop" },
  { name: "SOLO LEVELING", img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop" },
]

export default function HoverRoster({ animeList = [], loading }) {
  const [activeItem, setActiveItem] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Use dynamic API data if available, filter for shorter names to look sleek
  const displayList = !loading && animeList.length > 0 
    ? animeList
        .filter(a => {
          const name = a.title_english || a.title;
          return name && name.length <= 18;
        })
        .slice(0, 5).map(a => ({
        name: (a.title_english || a.title).toUpperCase(),
        img: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url
      }))
    : roster

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen bg-[#050505] py-32 flex flex-col items-center justify-center cursor-crosshair overflow-hidden"
    >
      
      {/* Background Dimmer when an item is active */}
      <div 
        className={`absolute inset-0 bg-[#050505] transition-opacity duration-700 z-0 ${activeItem ? 'opacity-80' : 'opacity-0'}`} 
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl px-4">
        <h3 className="text-white/30 text-sm md:text-base tracking-[0.4em] uppercase font-black mb-20 text-center">
          The Legends Roster
        </h3>
        
        {displayList.map((item, idx) => (
          <div 
            key={idx}
            onMouseEnter={() => setActiveItem(item)}
            onMouseLeave={() => setActiveItem(null)}
            className="w-full flex justify-center py-6 md:py-10 border-b border-white/5 last:border-b-0 group"
          >
            <h2 className="text-5xl md:text-8xl lg:text-9xl font-black text-transparent transition-all duration-500 tracking-tighter text-center pointer-events-auto"
                style={{ 
                  WebkitTextStroke: activeItem === item ? '0px transparent' : '1px rgba(255,255,255,0.2)',
                  color: activeItem === item ? '#ffffff' : 'transparent',
                  textShadow: activeItem === item ? '0 0 80px rgba(255,255,255,0.4)' : 'none',
                  transform: activeItem === item ? 'scale(1.05)' : 'scale(1)'
                }}
            >
              {item.name}
            </h2>
          </div>
        ))}
      </div>

      {/* Floating Image attached to cursor */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            className="fixed top-0 left-0 w-[80vw] h-[50vh] md:w-[40vw] md:h-[55vh] rounded-3xl overflow-hidden pointer-events-none z-0 shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              x: mousePos.x - (window.innerWidth < 768 ? window.innerWidth * 0.4 : window.innerWidth * 0.2),
              y: mousePos.y - (window.innerHeight < 768 ? window.innerHeight * 0.25 : window.innerHeight * 0.275),
              opacity: 1,
              scale: 1,
              rotate: (mousePos.x / window.innerWidth - 0.5) * 15 // Dynamic 3D tilt based on X pos
            }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
            transition={{ type: "spring", stiffness: 70, damping: 20, mass: 0.5 }}
          >
            <img 
              src={activeItem.img} 
              alt={activeItem.name} 
              className="w-full h-full object-cover scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
      
    </section>
  )
}
