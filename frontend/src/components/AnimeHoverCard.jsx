import React from 'react';
import { Link } from 'react-router-dom';
import { Captions, Play, Mic } from 'lucide-react';
import { getImageUrl } from '../utils/image';

export default function AnimeHoverCard({ anime, position = 'right' }) {
  if (!anime) return null;

  // Determine classes based on position
  const positionClasses = position === 'right' 
    ? 'left-[105%] top-1/2 -translate-y-[20%]' 
    : 'right-[105%] top-1/2 -translate-y-[20%]';

  return (
    <div className={`hidden lg:flex flex-col absolute z-50 w-[300px] bg-[#1c1c1c] rounded-xl border border-white/10 p-5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 delay-300 pointer-events-none ${positionClasses}`}>
      <img src={getImageUrl(anime.posterPath || anime.cover || anime.thumbnail)} className="w-full h-40 object-cover rounded-xl mb-4" alt={anime.title} ></img>
      <h4 className="text-lg font-bold text-white mb-2 leading-tight">{anime.title}</h4>
      
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-3">
        <span className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-sm text-white">PG-13</span>
        <span className="bg-[#8b5cf6] text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1"><Captions size={10} />{anime.totalEpisodes || anime.episodes?.length || '?'}</span>
        <span className="bg-[#eab308] text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1"><Mic size={10} />{anime.totalEpisodes || anime.episodes?.length || '?'}</span>
      </div>
      
      <p className="text-xs text-neutral-400 line-clamp-4 mb-4 leading-relaxed">
        {anime.description || 'No description available for this anime.'}
      </p>
      
      <div className="flex flex-col gap-1.5 text-[11px] text-neutral-400 mb-4">
        <div><span className="text-neutral-500 mr-1">Scores:</span> <span className="text-white">{anime.rating ? `${anime.rating}/10` : 'N/A'}</span></div>
        <div><span className="text-neutral-500 mr-1">Year:</span> <span className="text-white">{anime.year || '2024'}</span></div>
        <div><span className="text-neutral-500 mr-1">Status:</span> <span className="text-white capitalize">{anime.status || 'Completed'}</span></div>
        <div><span className="text-neutral-500 mr-1">Genre:</span> 
          <span className="text-[#6c5ce7]">
            {anime.genres 
              ? [...new Set(anime.genres.flatMap(g => g.split(',').map(s => s.trim())).filter(Boolean))].join(', ')
              : 'Action, Drama'}
          </span>
        </div>
      </div>
      
      <Link 
        to={`/anime/${anime._id}`} 
        className="w-full py-2.5 bg-[#dcdcdc] hover:bg-white text-black text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors pointer-events-auto"
      >
        <Play size={16} className="fill-black" /> Watch
      </Link>
    </div>
  );
}
