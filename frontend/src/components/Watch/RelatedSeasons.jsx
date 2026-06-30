import React from 'react';
import { getImageUrl } from '../../utils/image';

export default function RelatedSeasons({ seasons, anime }) {
  return (
    <div className="w-full max-w-[1400px] mx-auto mt-8 flex flex-col gap-6 px-4">
      
      {/* Next Episode Box */}
      <div className="w-full rounded-2xl bg-[#110e16] border border-white/5 p-8 flex items-center justify-center text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#f33767]/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
        <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest leading-relaxed">
          The next episode is expected to be released on <br />
          <span className="font-black text-white text-lg mt-2 inline-block drop-shadow-md">
            2026/07/04 5:00:00 AM
          </span>
        </p>
      </div>

      {/* Seasons Box */}
      <div className="w-full bg-[#110e16] rounded-2xl border border-white/5 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f33767]/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
          <span className="w-1.5 h-6 bg-[#f33767] rounded-full shadow-[0_0_10px_rgba(243,55,103,0.5)]"></span>
          Seasons
        </h3>
        <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar pb-4 [scrollbar-width:none]">
          {seasons.map((s, i) => (
            <div key={i} className="flex-shrink-0 w-[200px] h-[110px] relative rounded-xl overflow-hidden cursor-pointer group border border-white/5 shadow-lg">
              <img 
                src={getImageUrl(anime?.cover || anime?.thumbnail)} 
                alt={s.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b12] to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 z-10">
                <span className="text-sm font-black text-white mb-1.5 tracking-wider drop-shadow-lg">{s.title}</span>
                <span className="text-[9px] font-black uppercase tracking-widest bg-[#f33767] text-white px-2 py-1 rounded-md shadow-[0_0_10px_rgba(243,55,103,0.5)] group-hover:scale-110 transition-transform">
                  {s.eps} Eps
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
