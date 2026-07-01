import React, { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// const genres = [
//   { title: "SHONEN", desc: "High-octane battles, unbreakable will, and legendary journeys.", color: "from-red-600 to-orange-500", img: "https://wallpaperaccess.com/full/1915382.jpg" },
//   { title: "SEINEN", desc: "Dark thrillers, mature themes, and mind-bending plots.", color: "from-purple-600 to-indigo-900", img: "https://otakukart.com/wp-content/uploads/2025/03/Seinen-Anime.jpg" },
//   { title: "SLICE OF LIFE", desc: "Heartwarming stories of everyday love and friendship.", color: "from-pink-500 to-rose-400", img: "https://wallpapercave.com/wp/wp5921545.jpg" },
//   { title: "ISEKAI", desc: "Reincarnated into magical new worlds with infinite possibilities.", color: "from-blue-500 to-cyan-400", img: "https://images6.alphacoders.com/130/1303873.png" },
// ]
const genres = [
  { title: "SHONEN", desc: "High-octane battles, unbreakable will, and legendary journeys.", color: "from-red-600 to-orange-500", img: "https://wallpaperaccess.com/full/1915382.jpg" },
  { title: "SEINEN", desc: "Dark thrillers, mature themes, and mind-bending plots.", color: "from-purple-600 to-indigo-900", img: "https://otakukart.com/wp-content/uploads/2025/03/Seinen-Anime.jpg" },
  { title: "SLICE OF LIFE", desc: "Heartwarming stories of everyday love and friendship.", color: "from-pink-500 to-rose-400", img: "https://wallpapercave.com/wp/wp5921545.jpg" },
  { title: "ISEKAI", desc: "Reincarnated into magical new worlds with infinite possibilities.", color: "from-blue-500 to-cyan-400", img: "https://images6.alphacoders.com/130/1303873.png" },
  { title: "SPORTS", desc: "Sweat, tears, and intense competition to reach the absolute top.", color: "from-emerald-500 to-teal-700", img: "http://googleusercontent.com/image_collection/image_retrieval/6941899188983204493_0" },
  { title: "ROMANCE", desc: "Butterfly moments, sweet heartstrings, and emotional rollercoasters.", color: "from-rose-400 to-red-400", img: "http://googleusercontent.com/image_collection/image_retrieval/2968889777273705256_0" },
  { title: "HORROR / THRILLER", desc: "Eerie atmospheres, psychological dread, and survival against the unknown.", color: "from-zinc-900 to-neutral-700", img: "http://googleusercontent.com/image_collection/image_retrieval/14086258645651018851_0" },
  { title: "CYBERPUNK / SCI-FI", desc: "Neon-lit dystopias, high-tech hacking, and futuristic chaos.", color: "from-cyan-500 to-fuchsia-600", img: "http://googleusercontent.com/image_collection/image_retrieval/11007577072981295098_0" },
  { title: "MECHA", desc: "Colossal steel giants, tactical warfare, and epic pilot duels.", color: "from-blue-700 to-slate-800", img: "http://googleusercontent.com/image_collection/image_retrieval/14428173440960670562_0" },
  { title: "FANTASY / MAGIC", desc: "Spellbinding sorcery, mythical beasts, and ancient kingdoms.", color: "from-amber-500 to-yellow-600", img: "http://googleusercontent.com/image_collection/image_retrieval/10715123913205920866_0" },
  { title: "MYSTERY / NOIR", desc: "Shadowy conspiracies, brilliant detectives, and unraveling deep secrets.", color: "from-slate-900 to-blue-950", img: "http://googleusercontent.com/image_collection/image_retrieval/17717113551245125484_0" },
  { title: "MILITARY / WARFARE", desc: "Gritty tactical battles, political intrigue, and the harsh realities of war.", color: "from-olive-600 to-stone-800", img: "https://images3.alphacoders.com/134/1344933.png" }, // Vinland Saga / Attack on Titan vibe
  { title: "SUPERNATURAL", desc: "Yokai, curses, and hidden spirits lurking just beyond human sight.", color: "from-indigo-900 to-purple-700", img: "https://images5.alphacoders.com/132/1325607.jpeg" }, // Jujutsu Kaisen / Monogatari vibe
  { title: "COMEDY / PARODY", desc: "Absurd gags, fourth-wall breaks, and non-stop laughing riots.", color: "from-yellow-400 to-orange-500", img: "https://images.alphacoders.com/605/605574.jpg" }, // Gintama / One Punch Man vibe
  { title: "HISTORICAL / SAMURAI", desc: "Clashing steel, ancient traditions, and legendary tales of old Japan.", color: "from-amber-800 to-zinc-900", img: "https://images3.alphacoders.com/105/1059495.jpg" }, // Demon Slayer / Vagabond vibe
  { title: "PSYCHOLOGICAL", desc: "Mind games, moral dilemmas, and intense battles of pure intellect.", color: "from-neutral-900 to-red-950", img: "https://images4.alphacoders.com/914/914022.jpg" }, // Monster / Classroom of the Elite vibe
  { title: "ADVENTURE / EXPLORATION", desc: "Vast uncharted lands, hidden treasures, and the thrill of the open road.", color: "from-lime-600 to-emerald-800", img: "https://images5.alphacoders.com/613/613944.jpg" } // Hunter x Hunter / Made in Abyss vibe
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
