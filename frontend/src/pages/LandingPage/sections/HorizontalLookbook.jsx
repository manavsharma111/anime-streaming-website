import React, { useRef, useState } from "react"
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from "framer-motion"

export default function HorizontalLookbook({ animeList = [], loading }) {
  const containerRef = useRef(null)

  // Use only authentic Jikan API data. No hardcoded fake images.
  const displayList = !loading && animeList.length > 0 ? animeList.slice(0, 12) : [];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Mathematically perfect scrolling:
  // Regardless of the track width, this translates it so its right edge always aligns perfectly with the screen's right edge at the end.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "calc(-100% + 100vw)"]);

  // Track the active card for Apple-style focus states and dynamic backgrounds
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (displayList.length === 0) return;
    const index = Math.round(latest * (displayList.length - 1));
    setActiveIndex(index);
  });

  if (displayList.length === 0) return null;

  return (
    <section
      ref={containerRef}
      // Set height proportionally to the number of items for smooth scrolling
      style={{ height: `${displayList.length * 100}vh` }}
      className="relative bg-[#050505] z-10"
    >
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* Dynamic Ambient Background (Glassmorphism Blur) */}
        <div className="absolute inset-0 z-0 bg-[#050505] overflow-hidden">
          <AnimatePresence mode="popLayout">
            {displayList[activeIndex] && (
              <motion.img
                key={activeIndex}
                src={displayList[activeIndex].images?.webp?.large_image_url || displayList[activeIndex].images?.jpg?.large_image_url}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.25, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full object-cover blur-[100px] saturate-150"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Global Lighting Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]/80 z-10 pointer-events-none" />

        {/* Horizontal Track */}
        <motion.div
          style={{ x }}
          // Start and end with padding so the first and last cards sit perfectly centered
          className="flex h-full items-center px-[10vw] md:px-[20vw] gap-8 md:gap-16 z-20"
        >
          {displayList.map((item, i) => {
            const isActive = i === activeIndex;
            const imgUrl = item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url;
            const rawTitle = item.title_english || item.title;
            
            return (
              <div
                key={i}
                // Transition the focus states (scale, blur, opacity) smoothly
                className={`w-[80vw] md:w-[60vw] shrink-0 h-[65vh] md:h-[75vh] flex flex-col justify-center items-center relative transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? "scale-100 opacity-100" : "scale-90 opacity-30 blur-[4px]"
                }`}
              >
                <div className="w-full h-full overflow-hidden relative rounded-2xl md:rounded-[2rem] shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={rawTitle}
                      className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out scale-105 group-hover:scale-100"
                    />
                  ) : (
                    // Premium Glassmorphism Placeholder for missing API images
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/0">
                      <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse mb-4" />
                      <span className="text-white/40 tracking-widest text-sm font-medium uppercase">Visual Unavailable</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Cinematic Typography */}
                  <div className="absolute bottom-10 md:bottom-16 left-8 md:left-16 right-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                      transition={{ duration: 0.6, delay: isActive ? 0.2 : 0 }}
                    >
                      <h3 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tighter drop-shadow-2xl leading-[1.1] mb-4">
                        {rawTitle}
                      </h3>
                      {item.score && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold border border-white/20">
                            ★ {item.score}
                          </span>
                          <span className="text-white/60 text-sm font-medium tracking-wide uppercase">
                            {item.status || "Airing"}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Progress Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {displayList.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === activeIndex ? "w-8 bg-white" : "w-2 bg-white/20"}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
