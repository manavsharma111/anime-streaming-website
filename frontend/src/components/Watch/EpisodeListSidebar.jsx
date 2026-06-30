import React from 'react';
import { Search } from 'lucide-react';

export default function EpisodeListSidebar({ 
  searchEpisode, setSearchEpisode, 
  episodesList, episode, 
  handleSelectEpisode 
}) {
  return (
    <aside className="w-full flex flex-col xl:sticky xl:top-[100px] h-[600px] xl:h-[calc(100vh-140px)]">
      {/* Filters Area */}
      <div className="flex gap-2 mb-4">
        <button className="flex-1 bg-[#1c1c1c] hover:bg-white/5 border border-white/5 rounded p-2 text-xs text-neutral-400">Sub & Dub</button>
        <button className="flex-1 bg-[#1c1c1c] hover:bg-white/5 border border-white/5 rounded p-2 text-xs text-neutral-400">001-024</button>
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Find num..." 
            value={searchEpisode}
            onChange={(e) => setSearchEpisode(e.target.value)}
            className="w-full h-full bg-[#1c1c1c] border border-white/5 rounded px-2 text-xs text-white focus:outline-none focus:border-[#6c5ce7]"
          />
        </div>
      </div>

      {/* Grid of Episodes */}
      <div className="grid grid-cols-5 gap-1.5 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#2a2a2a_transparent]">
        {episodesList
          .filter(ep => searchEpisode ? ep.episodeNumber?.toString().includes(searchEpisode) : true)
          .map((ep, idx) => {
            const isActive = (ep._id || ep) === episode._id;
            return (
              <button
                key={ep._id || idx}
                onClick={() => handleSelectEpisode(ep)}
                className={`w-full aspect-square flex items-center justify-center text-xs font-bold rounded transition-colors ${
                  isActive 
                    ? 'bg-[#6c5ce7] text-white' 
                    : 'bg-[#1c1c1c] hover:bg-white/10 text-neutral-300'
                }`}
                title={ep.title || `Episode ${ep.episodeNumber}`}
              >
                {ep.episodeNumber}
              </button>
            );
          })}
      </div>
    </aside>
  );
}
