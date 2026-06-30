import React from 'react';
import { getImageUrl } from '../../utils/image';

export default function AnimeSidebar({ anime }) {
  return (
    <aside className="hidden xl:flex flex-col gap-6 sticky top-[100px]">
      <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 relative group">
        <img 
          src={getImageUrl(anime?.cover || anime?.thumbnail)} 
          alt={anime?.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b12] via-[#0e0b12]/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="bg-[#f33767]/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg uppercase tracking-widest border border-white/10">
            {anime?.type || 'TV'} • {anime?.status || 'Completed'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-black text-white leading-tight">{anime?.title}</h1>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <span className="text-[#ffc107] flex items-center gap-1">★ {anime?.rating || 'N/A'}</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400">{anime?.year || '2024'}</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400 bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-md">HD</span>
        </div>
        <p className="text-xs text-neutral-400 font-medium leading-relaxed line-clamp-6 mt-2 bg-[#110e16] p-4 rounded-xl border border-white/5">
          {anime?.description || 'No description available for this anime. Please check back later for updates.'}
        </p>
      </div>
    </aside>
  );
}
