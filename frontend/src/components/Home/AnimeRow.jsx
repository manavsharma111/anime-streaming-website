import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Heart, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../utils/image';

export default function AnimeRow({ title, animes, loading }) {
  const rowRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredAnime, setHoveredAnime] = useState(null);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScrollEvent = () => {
      if (rowRef.current) setIsScrolled(rowRef.current.scrollLeft > 0);
    };
    const currentRef = rowRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScrollEvent);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScrollEvent);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="my-8 px-4 md:px-12">
        <h2 className="text-xl md:text-2xl font-black text-white mb-4 animate-pulse bg-neutral-800 h-8 w-48 rounded-md"></h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[160px] md:min-w-[240px] aspect-[16/9] bg-neutral-900 animate-pulse rounded-md flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!animes || animes.length === 0) return null;

  return (
    <div className="relative my-8 px-4 md:px-12 group">
      <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight drop-shadow-md">
        {title}
      </h2>

      {/* Navigation Chevrons */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 h-full px-2 bg-gradient-to-r from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={40} className="drop-shadow-2xl" />
          </motion.button>
        )}
      </AnimatePresence>

      <button 
        onClick={() => handleScroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-40 h-full px-2 bg-gradient-to-l from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={40} className="drop-shadow-2xl" />
      </button>

      {/* Row Container */}
      <div 
        ref={rowRef}
        className="flex gap-4 overflow-x-scroll scrollbar-hide scroll-smooth pb-10 -mb-10 pt-4 -mt-4 px-2 -mx-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {animes.map((anime) => (
          <div 
            key={anime._id}
            className="relative flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] transition-transform duration-300 transform origin-center hover:scale-110 hover:z-30 cursor-pointer"
            onMouseEnter={() => setHoveredAnime(anime._id)}
            onMouseLeave={() => setHoveredAnime(null)}
          >
            <Link to={`/anime/${anime._id}`} className="block relative aspect-[16/9] rounded-md overflow-hidden bg-neutral-900 border border-white/5 shadow-lg">
              <img 
                src={getImageUrl(anime.cover || anime.thumbnail)} 
                alt={anime.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1 z-10">
                <span className="bg-red-600 text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg">EP {anime.episodes?.length || 0}</span>
              </div>
              
              {/* Hover Dropdown Details (Netflix style) */}
              <AnimatePresence>
                {hoveredAnime === anime._id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 flex flex-col justify-end z-20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-neutral-300 transition-colors">
                        <Play fill="currentColor" size={14} className="ml-0.5" />
                      </button>
                      <button className="w-8 h-8 bg-neutral-800/80 border border-neutral-600 rounded-full flex items-center justify-center text-white hover:border-white transition-colors">
                        <Plus size={16} />
                      </button>
                      <button className="w-8 h-8 bg-neutral-800/80 border border-neutral-600 rounded-full flex items-center justify-center text-white hover:border-white transition-colors ml-auto">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    
                    <h3 className="text-white font-black text-sm line-clamp-1 mb-1 drop-shadow-md">{anime.title}</h3>
                    
                    <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-300 mb-1">
                      <span className="text-green-500">{(anime.rating * 10) || 85}% Match</span>
                      <span className="border border-neutral-500 px-1 rounded">{anime.ageRating || '16+'}</span>
                      <span>{anime.year || '2025'}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400">
                      {(anime.genres || []).slice(0, 3).map((g, idx) => (
                        <span key={idx} className="flex items-center">
                          {g}
                          {idx < Math.min(anime.genres.length - 1, 2) && <span className="mx-1 text-neutral-600">•</span>}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
