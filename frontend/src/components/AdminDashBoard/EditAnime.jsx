import React, { useState, useEffect } from 'react';
import { Edit, Image as ImageIcon, Film, Calendar, Star, Info, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../services/api';

export default function EditAnime({ anime, onBack, onSuccess }) {
  const [animeData, setAnimeData] = useState({ 
    title: '', description: '', genres: '', type: 'TV', 
    trailerUrl: '', year: new Date().getFullYear(), rating: 8.0 
  });
  
  const [files, setFiles] = useState({
    thumbnail: null,
    cover: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (anime) {
      setAnimeData({
        title: anime.title || '',
        description: anime.description || '',
        genres: anime.genres ? anime.genres.join(', ') : '',
        type: anime.type || 'TV',
        trailerUrl: anime.trailerUrl || '',
        year: anime.year || new Date().getFullYear(),
        rating: anime.rating || 8.0,
      });
    }
  }, [anime]);

  const handleEditAnimeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('title', animeData.title);
      formData.append('description', animeData.description);
      formData.append('type', animeData.type);
      formData.append('trailerUrl', animeData.trailerUrl);
      formData.append('year', animeData.year);
      formData.append('rating', animeData.rating);
      
      const uniqueGenres = [...new Set(animeData.genres.split(',').map(g => g.trim()).filter(Boolean))];
      uniqueGenres.forEach(genre => formData.append('genres[]', genre)); 
      
      // Alternative: Just pass it as comma separated string as backend createAnime does
      formData.set('genres', uniqueGenres.join(','));

      if (files.thumbnail) {
        formData.append('thumbnail', files.thumbnail);
      }
      if (files.cover) {
        formData.append('cover', files.cover);
      }

      await axiosInstance.put(`/anime-admin/${anime._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      
      if (onSuccess) onSuccess();
    } catch (err) { 
      setError(err.response?.data?.message || 'Failed to update series.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Edit className="w-6 h-6" />
            </div>
            Edit Series: {anime.title}
          </h2>
          <p className="text-neutral-400 text-sm">Update the metadata and cover images for this series.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleEditAnimeSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4" /> Title
            </label>
            <input 
              type="text" value={animeData.title} 
              onChange={e => setAnimeData({...animeData, title: e.target.value})} 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors" 
              required 
            />
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4" /> Genres
            </label>
            <input 
              type="text" value={animeData.genres} 
              onChange={e => setAnimeData({...animeData, genres: e.target.value})} 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors" 
              required 
            />
          </div>
        </div>
        
        {/* Synopsis */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4" /> Synopsis
          </label>
          <textarea 
            rows="4" value={animeData.description} 
            onChange={e => setAnimeData({...animeData, description: e.target.value})} 
            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white resize-none transition-colors" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Year */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Release Year
            </label>
            <input 
              type="number" value={animeData.year} 
              onChange={e => setAnimeData({...animeData, year: e.target.value})} 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors" 
              required 
            />
          </div>
          
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4" /> Rating (0-10)
            </label>
            <input 
              type="number" step="0.1" max="10" min="0" value={animeData.rating} 
              onChange={e => setAnimeData({...animeData, rating: e.target.value})} 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors" 
              required 
            />
          </div>
          
          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4" /> Format
            </label>
            <select 
              value={animeData.type} 
              onChange={e => setAnimeData({...animeData, type: e.target.value})} 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white cursor-pointer transition-colors"
            >
              <option value="TV">TV Series</option>
              <option value="Movie">Movie</option>
              <option value="OVA">OVA</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Cover Banner (Upload New)
            </label>
            <input 
              type="file" accept="image/*"
              onChange={e => setFiles({...files, cover: e.target.files[0]})} 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500 hover:file:text-white" 
            />
            {anime.cover && !files.cover && <p className="text-[10px] text-neutral-500 mt-1">Current: {anime.cover.split('/').pop()}</p>}
          </div>
          
          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Thumbnail (Upload New)
            </label>
            <input 
              type="file" accept="image/*"
              onChange={e => setFiles({...files, thumbnail: e.target.files[0]})} 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500 hover:file:text-white" 
            />
            {anime.thumbnail && !files.thumbnail && <p className="text-[10px] text-neutral-500 mt-1">Current: {anime.thumbnail.split('/').pop()}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4" /> YouTube Trailer URL (Optional)
          </label>
          <input 
            type="url" value={animeData.trailerUrl} 
            onChange={e => setAnimeData({...animeData, trailerUrl: e.target.value})} 
            placeholder="https://www.youtube.com/watch?v=..." 
            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors" 
          />
        </div>

        <div className="pt-4 border-t border-white/5">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>Save Changes</>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
