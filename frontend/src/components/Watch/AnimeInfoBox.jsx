import React from 'react';
import { getImageUrl } from '../../utils/image';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, deleteWishlist } from '../../redux/slice/wishlistSlice';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnimeInfoBox({ anime }) {
  const dispatch = useDispatch();
  const { wishlist } = useSelector(state => state.wishlist);
  const { isAuthenticated } = useSelector(state => state.auth);

  if (!anime) return null;

  // Check if anime is in wishlist
  const wishlistItem = wishlist?.find(item => 
    item.anime?._id === anime._id || item.anime === anime._id
  );
  const isInWishlist = !!wishlistItem;

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to watchlist");
      return;
    }
    
    if (isInWishlist) {
      dispatch(deleteWishlist(wishlistItem._id))
        .unwrap()
        .then(() => toast.success("Removed from watchlist"))
        .catch(err => toast.error(err.message || "Failed to remove"));
    } else {
      dispatch(addToWishlist({ anime: anime._id }))
        .unwrap()
        .then(() => toast.success("Added to watchlist"))
        .catch(err => toast.error(err.message || "Failed to add"));
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Poster */}
        <div className="w-full md:w-[200px] flex-shrink-0">
          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group">
            <img 
              src={getImageUrl(anime?.cover || anime?.thumbnail)} 
              alt={anime?.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
        
        {/* Right Side: Details */}
        <div className="flex flex-col flex-grow text-sm text-neutral-400 font-medium">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-black text-white leading-tight">{anime?.title}</h1>
            
            <button 
              onClick={handleWishlistToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                isInWishlist 
                  ? 'bg-[#f33767]/20 border-[#f33767]/50 text-[#f33767]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              }`}
            >
              <Heart size={18} fill={isInWishlist ? "#f33767" : "transparent"} />
              <span className="hidden sm:inline text-xs font-bold tracking-widest uppercase">
                {isInWishlist ? 'In Watchlist' : 'Add to List'}
              </span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-4">
            <span className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-sm text-white">PG-13</span>
            <span className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-sm text-white">HD</span>
            <span className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-sm text-white">CC</span>
          </div>

          <p className="text-sm leading-relaxed mb-6 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
            {anime?.description || 'No description available for this anime. Please check back later for updates.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div><span className="text-neutral-500 mr-2">Type:</span> <span className="text-white">TV</span></div>
            <div><span className="text-neutral-500 mr-2">Scores:</span> <span className="text-white">{anime?.rating || 'N/A'}</span></div>
            <div><span className="text-neutral-500 mr-2">Status:</span> <span className="text-[#f33767] capitalize">{anime?.status || 'Completed'}</span></div>
            <div><span className="text-neutral-500 mr-2">Year:</span> <span className="text-white">{anime?.year || 'N/A'}</span></div>
            <div><span className="text-neutral-500 mr-2">Genres:</span> 
              <span className="text-white">
                {anime?.genres ? (
                  [...new Set(anime?.genres.flatMap(g => g.split(',').map(s => s.trim())).filter(Boolean))].map((g, i, arr) => (
                    <span key={i}>
                      <span className="text-neutral-300 hover:text-[#f33767] cursor-pointer transition-colors">{g}</span>
                      {i < arr.length - 1 && ', '}
                    </span>
                  ))
                ) : 'N/A'}
              </span>
            </div>
            <div><span className="text-neutral-500 mr-2">Views:</span> <span className="text-white">{anime?.views || 0}</span></div>
          </div>
        </div>
      </div>

      {/* Comments Section Placeholder */}
      {/* <div className="w-full mt-6 bg-[#110e16] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 text-neutral-400 text-xs font-bold rounded-lg cursor-pointer">Anime</span>
            <span className="px-3 py-1 bg-[#6c5ce7] text-white text-xs font-bold rounded-lg cursor-pointer">Episode SUB</span>
          </div>
        </div>
        <div className="p-12 flex items-center justify-center">
          <button className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-bold rounded-lg transition-colors border border-white/10">
            Load comments
          </button>
        </div>
      </div> */}
    </div>
  );
}
