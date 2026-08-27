import React, { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
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
  {
    title: "SHONEN",
    searchGenre: "Shounen",
    desc: "High-octane battles, unbreakable will, and legendary journeys.",
    color: "from-red-600 to-orange-500",
    img: "https://wallpaperaccess.com/full/1915382.jpg",
  },
  {
    title: "SEINEN",
    searchGenre: "Seinen",
    desc: "Dark thrillers, mature themes, and mind-bending plots.",
    color: "from-purple-600 to-indigo-900",
    img: "https://otakukart.com/wp-content/uploads/2025/03/Seinen-Anime.jpg",
  },
  {
    title: "SLICE OF LIFE",
    searchGenre: "Slice of Life",
    desc: "Heartwarming stories of everyday love and friendship.",
    color: "from-pink-500 to-rose-400",
    img: "https://wallpapercave.com/wp/wp5921545.jpg",
  },
  {
    title: "ISEKAI",
    searchGenre: "Isekai",
    desc: "Reincarnated into magical new worlds with infinite possibilities.",
    color: "from-blue-500 to-cyan-400",
    img: "https://images6.alphacoders.com/130/1303873.png",
  },
  {
    title: "SPORTS",
    searchGenre: "Sports",
    desc: "Sweat, tears, and intense competition to reach the absolute top.",
    color: "from-emerald-500 to-teal-700",
    img: "https://images.wallpapersden.com/image/download/kuroko-no-basket-team-akashi-seijuurou_a2tmZ5SZmpqtpaSklG1qaW6taW5mbQ.jpg",
  },
  {
    title: "ROMANCE",
    searchGenre: "Romance",
    desc: "Butterfly moments, sweet heartstrings, and emotional rollercoasters.",
    color: "from-rose-400 to-red-400",
    img: "https://wallpapercave.com/wp/wp15082627.jpg",
  },
  {
    title: "HORROR / THRILLER",
    searchGenre: "Horror",
    desc: "Eerie atmospheres, psychological dread, and survival against the unknown.",
    color: "from-zinc-900 to-neutral-700",
    img: "https://tse2.mm.bing.net/th/id/OIP.D1O9rqcA5bMaB_Ue8t_N7gHaEt?r=0&w=4036&h=2568&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    title: "CYBERPUNK / SCI-FI",
    searchGenre: "Sci-Fi",
    desc: "Neon-lit dystopias, high-tech hacking, and futuristic chaos.",
    color: "from-cyan-500 to-fuchsia-600",
    img: "https://wallpaperaccess.com/full/7526316.jpg",
  },
  // {
  //   title: "MECHA",
  //   searchGenre: "Mecha",
  //   desc: "Colossal steel giants, tactical warfare, and epic pilot duels.",
  //   color: "from-blue-700 to-slate-800",
  //   img: "https://tse3.mm.bing.net/th/id/OIP.GnWblD0CiOFyJ2VogC2hOwHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  // },
  {
    title: "FANTASY / MAGIC",
    searchGenre: "Fantasy",
    desc: "Spellbinding sorcery, mythical beasts, and ancient kingdoms.",
    color: "from-amber-500 to-yellow-600",
    img: "https://wallpapercave.com/wp/wp14739070.jpg",
  },
  // {
  //   title: "MYSTERY / NOIR",
  //   searchGenre: "Mystery",
  //   desc: "Shadowy conspiracies, brilliant detectives, and unraveling deep secrets.",
  //   color: "from-slate-900 to-blue-950",
  //   img: "https://comicbook.com/wp-content/uploads/sites/4/2025/06/mystery-anime_monster-link-click-apothecary-diaries-01.jpg?resize=2000",
  // },
  // {
  //   title: "MILITARY / WARFARE",
  //   searchGenre: "Military",
  //   desc: "Gritty tactical battles, political intrigue, and the harsh realities of war.",
  //   color: "from-olive-600 to-stone-800",
  //   img: "https://a-static.besthdwallpaper.com/86-eighty-six-wallpaper-2560x1440-84185_51.jpg",
  // },
  {
    title: "SUPERNATURAL",
    searchGenre: "Supernatural",
    desc: "Yokai, curses, and hidden spirits lurking just beyond human sight.",
    color: "from-indigo-900 to-purple-700",
    img: "https://tse2.mm.bing.net/th/id/OIP.FKSV0vdGywwnvU_r3farGgHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  // {
  //   title: "COMEDY / PARODY",
  //   searchGenre: "Comedy",
  //   desc: "Absurd gags, fourth-wall breaks, and non-stop laughing riots.",
  //   color: "from-yellow-400 to-orange-500",
  //   img: "https://wallpapers.com/images/hd/spy-x-family-character-poster-v2te3s9dlozrcv6v.jpg",
  // },
  // {
  //   title: "HISTORICAL / SAMURAI",
  //   searchGenre: "Samurai",
  //   desc: "Clashing steel, ancient traditions, and legendary tales of old Japan.",
  //   color: "from-amber-800 to-zinc-900",
  //   img: "https://tse3.mm.bing.net/th/id/OIP.xeo-pPUZQ82y1fk6sh557gHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  // },
  {
    title: "PSYCHOLOGICAL",
    searchGenre: "Psychological",
    desc: "Mind games, moral dilemmas, and intense battles of pure intellect.",
    color: "from-neutral-900 to-red-950",
    img: "https://tse4.mm.bing.net/th/id/OIP.iT_LrhRwXD-yPs7Ow4IruQHaEK?r=0&w=2560&h=1440&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    title: "ADVENTURE / EXPLORATION",
    searchGenre: "Adventure",
    desc: "Vast uncharted lands, hidden treasures, and the thrill of the open road.",
    color: "from-lime-600 to-emerald-800",
    img: "https://wallpapercave.com/wp/wp5428868.jpg",
  },
]
export default function StackedGenreCards() {
  const containerRef = useRef(null)
  const sliderRef = useRef(null)
  const cardsRef = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    const ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
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

          // Scale down and shift up the previous cards
          for (let i = 0; i < index; i++) {
            tl.to(
              cardsRef.current[i],
              {
                scale: 1 - (index - i) * 0.05,
                yPercent: -(index - i) * 2,
                opacity: 1 - (index - i) * 0.1,
                ease: "none",
              },
              `stack-${index}`,
            )
          }
        })
      });

      mm.add("(max-width: 767px)", () => {
        // Horizontal scroll tied to vertical scroll for mobile
        gsap.set(cardsRef.current, { clearProps: "all" })
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${genres.length * 100}%`, // Scroll duration
            scrub: 1,
            pin: true,
          },
        })

        // Calculate the total distance to move
        // We move the slider container to the left by (100% - viewport width)
        const paddingRight = 24 // Accounts for px-6
        tl.to(sliderRef.current, {
          x: () => -(sliderRef.current.scrollWidth - window.innerWidth + paddingRight),
          ease: "none",
        })
      });

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#050505] flex flex-col items-start md:items-center z-20 py-16 md:py-0 overflow-hidden"
    >
      <div className="md:absolute top-10 w-full flex flex-col items-center z-30 mb-8 md:mb-0 px-4 md:px-0">
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter mb-2 text-center leading-none">
          DISCOVER BY GENRE
        </h2>
      </div>

      <div 
        ref={sliderRef}
        className="relative flex flex-row md:block w-max md:w-full max-w-none md:max-w-5xl md:h-[80vh] gap-6 md:gap-0 px-6 md:px-0 mt-8 md:mt-16 self-start md:self-auto"
      >
        {genres.map((genre, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            className="shrink-0 w-[80vw] md:w-full relative md:absolute md:top-0 left-0 h-[65vh] md:h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex items-center justify-center border border-white/10 origin-top"
            style={{ zIndex: i }}
          >
            {/* Background Image */}
            <img
              src={genre.img}
              alt={genre.title}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
            />

            {/* Dynamic Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-40 mix-blend-overlay`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/20 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6">
              <h3 className="text-6xl md:text-9xl font-black text-white tracking-tighter drop-shadow-2xl">
                {genre.title}
              </h3>
              <p className="text-white/70 text-lg md:text-2xl mt-6 font-medium max-w-lg leading-relaxed">
                {genre.desc}
              </p>

              <div
                className="mt-8 px-8 py-3 rounded-full border border-white/20 bg-[#111] md:bg-white/5 md:backdrop-blur-md text-white font-bold tracking-widest text-sm uppercase cursor-pointer hover:bg-white hover:text-black transition-colors duration-300 pointer-events-auto"
                onClick={() =>
                  navigate(
                    `/search?genres=${encodeURIComponent(genre.searchGenre)}`,
                  )
                }
              >
                Explore Universe
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
