import React from 'react';
import AnimeCard from './AnimeCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnimeSection = ({ title, icon: Icon, animes, isLoading, viewAllLink, tabs }) => {
  const [activeTab, setActiveTab] = React.useState(tabs ? tabs[0] : null);
  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-[#f33767]/10 flex items-center justify-center text-[#f33767] shadow-[0_0_15px_rgba(243,55,103,0.15)] border border-[#f33767]/20">
              <Icon size={20} />
            </div>
          )}
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">{title}</h2>
        </div>
        {tabs ? (
          <div className="flex items-center gap-4 text-[11px] font-bold tracking-widest uppercase text-neutral-400">
            {tabs.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`transition-colors ${activeTab === tab ? 'text-[#f33767]' : 'hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
            <div className="flex items-center gap-1 ml-2 text-neutral-500">
              <button className="hover:text-white transition-colors"><ChevronLeft size={16} /></button>
              <button className="hover:text-white transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        ) : viewAllLink ? (
          <Link 
            to={viewAllLink} 
            className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-[#f33767] transition-colors uppercase tracking-wider"
          >
            View All <ChevronRight size={14} />
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full aspect-[3/4] rounded-xl bg-white/5 animate-pulse border border-white/5"></div>
              <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse mt-1"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {animes?.map((anime) => (
            <AnimeCard key={anime._id} anime={anime} />
          ))}
        </div>
      )}
    </section>
  );
};

export default AnimeSection;
