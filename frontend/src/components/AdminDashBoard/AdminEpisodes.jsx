import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Trash2, Edit, Save, X, ListVideo, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../services/api';
import { getImageUrl } from '../../utils/image';

export default function AdminEpisodes({ anime, onBack }) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEpisode, setEditingEpisode] = useState(null);

  // Edit form state
  const [formData, setFormData] = useState({
    title: "",
    episodeNumber: "",
    introStart: 0,
    introEnd: 0,
    outroStart: 0,
    outroEnd: 0
  });

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/anime-admin/episodes/${anime._id}`);
      if (res.data.success) {
        setEpisodes(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch episodes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, [anime._id]);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/anime-admin/episode/${id}`);
      fetchEpisodes();
    } catch (err) {
      console.error("Failed to delete episode", err);
      alert("Failed to delete episode");
    }
  };

  const openEditModal = (ep) => {
    setFormData({
      title: ep.title || "",
      episodeNumber: ep.episodeNumber || "",
      introStart: ep.introStart || 0,
      introEnd: ep.introEnd || 0,
      outroStart: ep.outroStart || 0,
      outroEnd: ep.outroEnd || 0
    });
    setEditingEpisode(ep);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/anime-admin/episode/${editingEpisode._id}`, formData);
      setEditingEpisode(null);
      fetchEpisodes();
    } catch (err) {
      console.error("Failed to update episode", err);
      alert("Failed to update episode metadata");
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <button 
            onClick={onBack}
            className="p-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <ListVideo className="text-indigo-500" /> Manage Episodes
            </h2>
            <p className="text-neutral-400 text-sm mt-1">Showing all episodes for <span className="font-bold text-white">{anime.title}</span></p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
          <div className="w-full">
            {/* Table Header (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-[120px_1fr_120px_160px_160px] bg-neutral-900/50 border-b border-white/5">
              <div className="p-5 text-xs font-bold text-neutral-500 uppercase tracking-wider">Thumb</div>
              <div className="p-5 text-xs font-bold text-neutral-500 uppercase tracking-wider">Details</div>
              <div className="p-5 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Status</div>
              <div className="p-5 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Skips (s)</div>
              <div className="p-5 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">Actions</div>
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-12 text-center text-neutral-500">Loading episodes...</div>
              ) : episodes.length === 0 ? (
                <div className="p-12 text-center text-neutral-500">No episodes found for this anime.</div>
              ) : (
                episodes.map((ep) => (
                  <div key={ep._id} className="flex flex-col md:grid md:grid-cols-[120px_1fr_120px_160px_160px] items-center hover:bg-white/[0.02] transition-colors p-4 md:p-0 gap-4 md:gap-0">
                    {/* Thumbnail */}
                    <div className="md:p-5 w-full md:w-auto flex justify-center md:justify-start">
                      <div className="relative overflow-hidden rounded-lg shadow-lg w-full max-w-[200px] md:w-24 h-32 md:h-16 bg-neutral-950">
                        {ep.thumbnailUrl ? (
                          <img src={getImageUrl(ep.thumbnailUrl)} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-700"><Play size={20} /></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="md:p-5 text-center md:text-left w-full md:w-auto">
                      <p className="font-black text-white text-base md:truncate">Ep {ep.episodeNumber}: {ep.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">Added: {new Date(ep.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    {/* Status */}
                    <div className="md:p-5 text-center w-full md:w-auto flex justify-between md:justify-center items-center border-t border-white/5 md:border-0 pt-3 md:pt-0">
                      <span className="md:hidden text-xs font-bold text-neutral-500 uppercase">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        ep.status === 'ready' ? 'bg-emerald-500/10 text-emerald-500' : 
                        ep.status === 'processing' ? 'bg-amber-500/10 text-amber-500' :
                        ep.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {ep.status}
                      </span>
                    </div>
                    
                    {/* Skips */}
                    <div className="md:p-5 text-center w-full md:w-auto flex justify-between md:justify-center items-center border-t border-white/5 md:border-0 pt-3 md:pt-0">
                      <span className="md:hidden text-xs font-bold text-neutral-500 uppercase">Skips:</span>
                      <div className="text-[10px] text-neutral-400 font-mono text-right md:text-center">
                        Intro: {ep.introStart}-{ep.introEnd} <br/>
                        Outro: {ep.outroStart}-{ep.outroEnd}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="md:p-5 text-center w-full md:w-auto flex justify-between md:justify-center items-center border-t border-white/5 md:border-0 pt-3 md:pt-0">
                      <span className="md:hidden text-xs font-bold text-neutral-500 uppercase">Actions:</span>
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openEditModal(ep)}
                          title="Edit Episode"
                          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Edit size={16} /> <span className="md:hidden text-xs font-bold">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(ep._id)}
                          title="Delete Episode"
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={16} /> <span className="md:hidden text-xs font-bold">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal - Rendered via Portal to bypass parent CSS transforms/filters */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {editingEpisode && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingEpisode(null)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: '85vh' }}
              >
                {/* Fixed Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-neutral-900 shrink-0">
                  <h3 className="text-xl font-black text-white">Edit Episode</h3>
                  <button onClick={() => setEditingEpisode(null)} className="text-neutral-400 hover:text-white p-1">
                    <X size={20} />
                  </button>
                </div>
                
                {/* Scrollable Form Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-neutral-900 flex-1">
                  <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-neutral-400 mb-1">Episode Number</label>
                        <input 
                          type="number" required
                          value={formData.episodeNumber}
                          onChange={(e) => setFormData({...formData, episodeNumber: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex-[3]">
                        <label className="block text-xs font-bold text-neutral-400 mb-1">Title</label>
                        <input 
                          type="text" required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                      <div className="col-span-2"><h4 className="text-xs font-bold text-indigo-400">Intro Skip (Seconds)</h4></div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Start Time</label>
                        <input type="number" step="1" value={formData.introStart} onChange={(e) => setFormData({...formData, introStart: Number(e.target.value)})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">End Time</label>
                        <input type="number" step="1" value={formData.introEnd} onChange={(e) => setFormData({...formData, introEnd: Number(e.target.value)})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                      <div className="col-span-2"><h4 className="text-xs font-bold text-pink-400">Outro Skip (Seconds)</h4></div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">Start Time</label>
                        <input type="number" step="1" value={formData.outroStart} onChange={(e) => setFormData({...formData, outroStart: Number(e.target.value)})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">End Time</label>
                        <input type="number" step="1" value={formData.outroEnd} onChange={(e) => setFormData({...formData, outroEnd: Number(e.target.value)})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white" />
                      </div>
                    </div>

                    <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Save size={18} /> Save Changes
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>

  );

}
