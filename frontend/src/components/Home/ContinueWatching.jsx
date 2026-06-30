import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Play, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { getImageUrl } from '../../utils/image';

export default function ContinueWatching() {
  const { history, isLoading } = useSelector(state => state.history);
  const { isAuthenticated } = useSelector(state => state.auth);
  const scrollContainer = useRef(null);

  // If not authenticated or no history, hide the component entirely.
  if (!isAuthenticated || !history || history.length === 0) return null;

  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = 400;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-widest">
          <Clock className="text-[#f33767]" size={24} />
          Continue Watching
        </h3>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button onClick={() => scroll('right')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainer}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {history.map((item, index) => {
          // Fallback handling in case anime/episode references are missing
          if (!item.anime || !item.episode) return null;
          
          const progressPercent = item.totalDuration ? (item.watchTime / item.totalDuration) * 100 : item.progress;

          return (
            <Link 
              to={`/watch/${item.episode._id || item.episode}`} 
              key={`${item._id}-${index}`}
              className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start group bg-[#110e16] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors block relative"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={getImageUrl(item.anime.cover || item.anime.thumbnail)} 
                  alt={item.anime.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-12 h-12 bg-[#f33767] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(243,55,103,0.5)]">
                    <Play size={20} className="text-white ml-1" />
                  </div>
                </div>
                
                {/* Progress Bar */}
                {progressPercent > 0 && (
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/60 backdrop-blur-sm">
                    <div 
                      className="h-full bg-[#f33767] shadow-[0_0_10px_rgba(243,55,103,0.8)] relative"
                      style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                    >
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#f33767] transition-colors">
                  {item.anime.title}
                </h4>
                <p className="text-neutral-400 text-xs mt-1 flex justify-between">
                  <span>Resume Episode {item.episode.episodeNumber || ''}</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
