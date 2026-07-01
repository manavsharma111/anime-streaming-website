import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const genres = [
  { title: "SHONEN", desc: "High-octane battles, unbreakable will, and legendary journeys.", color: "from-red-600 to-orange-500", img: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2560&auto=format&fit=crop" },
  { title: "SEINEN", desc: "Dark thrillers, mature themes, and mind-bending plots.", color: "from-purple-600 to-indigo-900", img: "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2560&auto=format&fit=crop" },
  { title: "SLICE OF LIFE", desc: "Heartwarming stories of everyday love and friendship.", color: "from-pink-500 to-rose-400", img: "https://images.unsplash.com/photo-1513628253939-010e64ac66cd?q=80&w=2560&auto=format&fit=crop" },
  { title: "ISEKAI", desc: "Reincarnated into magical new worlds with infinite possibilities.", color: "from-blue-500 to-cyan-400", img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2560&auto=format&fit=crop" },
]

export default function StackedGenreCards() {
  const containerRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${genres.length * 100}%`,
          scrub: 1,
          pin: true,
        },
      })

      // Set all cards except the first to be completely below the screen initially
      gsap.set(cardsRef.current.slice(1), { y: "100vh" })

      cardsRef.current.forEach((card, index) => {
        if (index === 0) return

        // Slide the current card up
        tl.to(card, { y: 0, ease: "none" }, `stack-${index}`)

        // Scale down, blur, and shift up the previous cards
        for (let i = 0; i < index; i++) {
          tl.to(
            cardsRef.current[i],
            {
              scale: 1 - (index - i) * 0.05,
              yPercent: -(index - i) * 2,
              filter: `blur(${(index - i) * 4}px)`,
              opacity: 1 - (index - i) * 0.1,
              ease: "none",
            },
            `stack-${index}`
          )
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col justify-center items-center z-20 px-4 md:px-0">
      
      <div className="absolute top-10 w-full flex flex-col items-center z-30">
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mb-2 text-center leading-none">
          DISCOVER BY GENRE
        </h2>
      </div>

      <div className="relative w-full max-w-5xl h-[75vh] md:h-[80vh] mt-16">
        {genres.map((genre, i) => (
          <div 
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            className="absolute top-0 left-0 w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/10 origin-top"
            style={{ zIndex: i }}
          >
            {/* Background Image */}
            <img 
              src={genre.img} 
              alt={genre.title}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
            />
            
            {/* Dynamic Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-40 mix-blend-overlay`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/20 to-transparent pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6">
              <h3 className="text-6xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl">
                {genre.title}
              </h3>
              <p className="text-white/70 text-lg md:text-2xl mt-6 font-medium max-w-lg leading-relaxed">
                {genre.desc}
              </p>
              
              <div className="mt-8 px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-bold tracking-widest text-sm uppercase cursor-pointer hover:bg-white hover:text-black transition-colors duration-300 pointer-events-auto">
                Explore Universe
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </section>
  )
}
