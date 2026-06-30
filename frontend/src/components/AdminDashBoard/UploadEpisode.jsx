import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Upload, Clock, AlertTriangle, CheckCircle2, Tv, FileVideo, Captions, Mic, Link as LinkIcon, Wand2, DatabaseZap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../services/api';
import CustomSelect from '../common/CustomSelect';
import { fetchAnimes } from '../../redux/slice/animeSlice';
import axios from 'axios';

export default function UploadEpisodeForm({ animesList }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('link'); // 'link', 'file', or 'bulk'
  
  const [formData, setFormData] = useState({
    anime: '', episodeNumber: '', title: '', scheduledAt: '', videoUrl: '',
    introStart: '', introEnd: '', outroStart: '', outroEnd: ''
  });

  const [files, setFiles] = useState({
    video: null,
    subtitles: [],
    audios: []
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingSkips, setIsFetchingSkips] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(prev => ({ ...prev, video: e.dataTransfer.files[0] }));
    }
  };

  const fetchSkipTimes = async () => {
    if (!formData.anime || !formData.episodeNumber) {
      return setStatusMessage({ type: 'error', text: 'Select an Anime and enter an Episode Number first.' });
    }
    
    setIsFetchingSkips(true);
    setStatusMessage({ type: 'info', text: 'Searching for AniSkip data...' });
    try {
      const selectedAnime = animesList.find(a => a._id === formData.anime);
      if (!selectedAnime) throw new Error("Anime not found in list.");
      
      const jikanRes = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(selectedAnime.title)}&limit=1`);
      if (!jikanRes.data.data || jikanRes.data.data.length === 0) {
        throw new Error("Could not find this anime on MyAnimeList to fetch skip times.");
      }
      const malId = jikanRes.data.data[0].mal_id;
      
      const aniskipRes = await axios.get(`https://api.aniskip.com/v2/skip-times/${malId}/${formData.episodeNumber}?types[]=op&types[]=ed&episodeLength=0`);
      
      if (aniskipRes.data.found) {
        const results = aniskipRes.data.results;
        const op = results.find(r => r.skipType === 'op');
        const ed = results.find(r => r.skipType === 'ed');
        
        setFormData(prev => ({
          ...prev,
          introStart: op ? Math.round(op.interval.startTime) : prev.introStart,
          introEnd: op ? Math.round(op.interval.endTime) : prev.introEnd,
          outroStart: ed ? Math.round(ed.interval.startTime) : prev.outroStart,
          outroEnd: ed ? Math.round(ed.interval.endTime) : prev.outroEnd,
        }));
        setStatusMessage({ type: 'success', text: `Found ${op ? 'Intro' : ''} ${op && ed ? 'and' : ''} ${ed ? 'Outro' : ''} skip times!` });
      } else {
        setStatusMessage({ type: 'error', text: 'No skip times available for this episode on AniSkip.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to fetch skip times.' });
    } finally {
      setIsFetchingSkips(false);
    }
  };

  const handleBulkFetch = async () => {
    if (!formData.anime) {
      return setStatusMessage({ type: 'error', text: 'Please select an Anime first.' });
    }
    
    const selectedAnime = animesList.find(a => a._id === formData.anime);
    if (!selectedAnime) return setStatusMessage({ type: 'error', text: 'Anime not found in list.' });

    setIsUploading(true);
    setStatusMessage({ type: 'info', text: 'Connecting to Consumet API... Fetching all episodes. This might take a minute.' });
    
    try {
      const res = await axiosInstance.post('/anime-admin/episodes/bulk-fetch', {
        anime: formData.anime,
        title: selectedAnime.title
      });
      setStatusMessage({ type: 'success', text: res.data.message || 'Bulk fetch complete!' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Failed to bulk fetch episodes.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'bulk') {
      return handleBulkFetch();
    }

    if (!formData.anime || !formData.episodeNumber) {
      return setStatusMessage({ type: 'error', text: 'Anime selection and episode number are required.' });
    }

    if (activeTab === 'file' && !files.video) {
      return setStatusMessage({ type: 'error', text: 'Video file is required for Local Upload.' });
    }
    if (activeTab === 'link' && !formData.videoUrl) {
      return setStatusMessage({ type: 'error', text: 'Direct M3U8 link is required.' });
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (activeTab === 'link') {
        setStatusMessage({ type: 'info', text: 'Saving direct link...' });
        await axiosInstance.post('/anime-admin/episode/link', {
          anime: formData.anime,
          episodeNumber: formData.episodeNumber,
          title: formData.title,
          videoUrl: formData.videoUrl,
          introStart: formData.introStart,
          introEnd: formData.introEnd,
          outroStart: formData.outroStart,
          outroEnd: formData.outroEnd,
        });
        setStatusMessage({ type: 'success', text: 'Episode link saved successfully! It is now live.' });
        setFormData(prev => ({ ...prev, title: '', episodeNumber: '', videoUrl: '', introStart: '', introEnd: '', outroStart: '', outroEnd: '' }));
      } else {
        setStatusMessage({ type: 'info', text: 'Preparing secure upload...' });
        const payload = new FormData();
        payload.append('anime', formData.anime);
        payload.append('episodeNumber', formData.episodeNumber);
        payload.append('title', formData.title || `Episode ${formData.episodeNumber}`);
        payload.append('video', files.video);
        Array.from(files.subtitles).forEach(file => payload.append('subtitles', file));
        Array.from(files.audios).forEach(file => payload.append('audios', file));
        
        if (formData.scheduledAt) payload.append('scheduledAt', formData.scheduledAt);
        if (formData.introStart) payload.append('introStart', formData.introStart);
        if (formData.introEnd) payload.append('introEnd', formData.introEnd);
        if (formData.outroStart) payload.append('outroStart', formData.outroStart);
        if (formData.outroEnd) payload.append('outroEnd', formData.outroEnd);

        await axiosInstance.post('/upload', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            if (percentCompleted === 100) setStatusMessage({ type: 'info', text: 'Upload complete! FFmpeg processing started.' });
          }
        });
        setStatusMessage({ type: 'success', text: 'Episode added to encoding pipeline successfully.' });
        setFiles({ video: null, subtitles: [], audios: [] });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add episode.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl"
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
              <Upload className="w-6 h-6" />
            </div>
            Add Episode
          </h2>
          <p className="text-neutral-400 text-sm">Add episodes via Direct Links (0s delay), Bulk Fetch, or Local Encode.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-neutral-950 rounded-xl p-1 border border-white/5 w-full md:w-auto gap-1">
          <button 
            onClick={() => setActiveTab('link')} type="button"
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'link' ? 'bg-orange-500 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
          >
            <LinkIcon size={16} /> Direct Link
          </button>
          <button 
            onClick={() => setActiveTab('bulk')} type="button"
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'bulk' ? 'bg-green-500 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
          >
            <DatabaseZap size={16} /> Bulk Auto-Fetch
          </button>
          <button 
            onClick={() => setActiveTab('file')} type="button"
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'file' ? 'bg-indigo-500 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
          >
            <FileVideo size={16} /> Local Encode
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info (Shared across all tabs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Tv className="w-4 h-4" /> Series
            </label>
            <CustomSelect
              options={animesList?.map(a => ({ label: a.title, value: a._id })) || []}
              value={formData.anime}
              onChange={(val) => setFormData({ ...formData, anime: val })}
              onSearch={(val) => {
                dispatch(fetchAnimes({ search: val, limit: 50 }));
              }}
              placeholder="Select Target Anime..."
              searchable={true}
              className={`w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:border-${activeTab === 'link' ? 'orange' : activeTab === 'bulk' ? 'green' : 'indigo'}-500 text-white cursor-pointer transition-colors`}
            />
          </div>
          
          {activeTab !== 'bulk' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ep. Number</label>
                <input 
                  type="number" name="episodeNumber" value={formData.episodeNumber} onChange={handleInputChange} placeholder="e.g. 1" 
                  className={`w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-${activeTab === 'link' ? 'orange' : 'indigo'}-500 text-white transition-colors`} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ep. Title (Optional)</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Name of episode" 
                  className={`w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-${activeTab === 'link' ? 'orange' : 'indigo'}-500 text-white transition-colors`} 
                />
              </div>
            </>
          )}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'link' && (
            <motion.div key="tab-link" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Video Stream URL (.m3u8)
                </label>
                <input 
                  type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://..." 
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 text-white transition-colors" 
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'bulk' && (
            <motion.div key="tab-bulk" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center space-y-3">
                <DatabaseZap className="w-12 h-12 text-green-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">Bulk Fetch All Episodes</h3>
                <p className="text-sm text-neutral-400 max-w-lg mx-auto">
                  Clicking the button below will automatically search the Consumet API for the selected Anime, find all available episodes, extract their streaming links, and instantly save them to your database.
                </p>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'file' && (
            <motion.div key="tab-file" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Media Assets</h4>
                
                <div 
                  className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-300 ${dragActive ? 'border-indigo-500 bg-indigo-500/5 scale-[1.02]' : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-600'}`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  <input type="file" accept="video/*" onChange={e => setFiles({...files, video: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isUploading} />
                  {files.video ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <FileVideo className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">{files.video.name}</p>
                        <p className="text-xs text-neutral-500 mt-1">{(files.video.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-500">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Drag & Drop Master Video File</p>
                        <p className="text-xs text-neutral-500 mt-1">MP4, MKV supported</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative flex items-center justify-between p-4 bg-neutral-950/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Captions className="w-5 h-5" /></div>
                      <div>
                        <p className="text-sm font-bold text-white">Subtitles (.vtt)</p>
                        <p className="text-[10px] text-neutral-500 uppercase">{files.subtitles.length} selected</p>
                      </div>
                    </div>
                    <input type="file" multiple accept=".vtt,.srt" onChange={e => setFiles({...files, subtitles: e.target.files})} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  
                  <div className="relative flex items-center justify-between p-4 bg-neutral-950/50 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Mic className="w-5 h-5" /></div>
                      <div>
                        <p className="text-sm font-bold text-white">Audio Tracks</p>
                        <p className="text-[10px] text-neutral-500 uppercase">{files.audios.length} selected</p>
                      </div>
                    </div>
                    <input type="file" multiple accept="audio/*" onChange={e => setFiles({...files, audios: e.target.files})} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timestamps (Hidden for Bulk Fetch) */}
        {activeTab !== 'bulk' && (
          <div className="bg-neutral-950/30 border border-neutral-800/50 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-500" /> Skip Timestamps (Seconds)
              </h4>
              <button 
                type="button" 
                onClick={fetchSkipTimes} 
                disabled={isFetchingSkips}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isFetchingSkips ? <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div> : <Wand2 size={14} />}
                Auto-Fetch (AniSkip)
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['introStart', 'introEnd', 'outroStart', 'outroEnd'].map(field => (
                <div key={field} className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-600 uppercase">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input 
                    type="number" name={field} value={formData[field]} onChange={handleInputChange} placeholder="0" 
                    className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-${activeTab === 'link' ? 'orange' : 'indigo'}-500 text-white transition-colors`} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && activeTab === 'file' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full space-y-2">
            <div className="flex justify-between text-xs font-bold text-neutral-400 tracking-wider">
              <span>UPLOADING TO PIPELINE</span>
              <span className="text-indigo-500">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
              <div style={{ width: `${uploadProgress}%` }} className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-300" />
            </div>
          </motion.div>
        )}

        {statusMessage.text && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : statusMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {statusMessage.text}
          </motion.div>
        )}

        <div className="pt-4 border-t border-white/5">
          <button 
            type="submit" disabled={isUploading} 
            className={`w-full py-4 ${activeTab === 'link' ? 'bg-orange-500 hover:bg-orange-600' : activeTab === 'bulk' ? 'bg-green-500 hover:bg-green-600' : 'bg-white text-black hover:bg-neutral-200'} disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2`}
          >
            {isUploading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : (activeTab === 'link' ? 'Save Direct Link' : activeTab === 'bulk' ? 'Bulk Fetch Episodes' : 'Push to Pipeline')}
          </button>
        </div>
      </form>
    </motion.div>
  );
}