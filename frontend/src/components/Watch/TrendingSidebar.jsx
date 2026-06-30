import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/api';
import { getImageUrl } from '../../utils/image';
import AnimeHoverCard from '../AnimeHoverCard';

export default function TrendingSidebar() {
  const [trending, setTrending] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Fetch trending/popular animes (using top-rated or recent for now)
        const res = await axiosInstance.get('/anime?sort=-rating&limit=8');
        if (res.data.success) {
          setTrending(res.data.data.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch trending", error);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 sticky top-[100px] z-50">
      <h2 className="text-xl font-bold text-white mb-2">Trending</h2>
      <div className="flex flex-col gap-3">
        {trending.map((anime) => (
          <div 
            key={anime._id}
            onClick={() => navigate(`/anime/${anime._id}`)}
            className="flex gap-4 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="w-16 h-20 rounded-lg relative flex-shrink-0 group">
              <div className="w-full h-full overflow-hidden rounded-lg">
                <img 
                  src={getImageUrl(anime.thumbnail || anime.cover)} 
                  alt={anime.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <AnimeHoverCard anime={anime} position="left" />
            </div>
            
            <div className="flex flex-col justify-center flex-grow py-1">
              <h3 className="text-sm font-bold text-white line-clamp-2 hover:text-[#f33767] transition-colors">
                {anime.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400 font-medium">
                <span className="text-[#ffc107]">★ {anime.rating ? `${anime.rating}/10` : 'N/A'}</span>
                <span>• TV • {anime.year}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
