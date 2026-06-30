import React, { useState } from 'react';
import { Upload, Clock, AlertTriangle, CheckCircle2, Tv, FileVideo, Captions, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../services/api';
import CustomSelect from '../common/CustomSelect';

export default function UploadEpisodeForm({ animesList }) {
  const [formData, setFormData] = useState({
    anime: '', episodeNumber: '', title: '', scheduledAt: '',
    introStart: '', introEnd: '', outroStart: '', outroEnd: ''
  });

  const [files, setFiles] = useState({
    video: null,
    subtitles: [],
    audios: []
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.anime || !formData.episodeNumber || !files.video) {
      return setStatusMessage({ type: 'error', text: 'Anime selection, episode number, and video file are required.' });
    }

    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage({ type: 'info', text: 'Preparing secure upload...' });

    const payload = new FormData();
    payload.append('anime', formData.anime);
    payload.append('episodeNumber', formData.episodeNumber);
    payload.append('title', formData.title || `Episode ${formData.episodeNumber}`);
    payload.append('video', files.video);
    
    // Append multiple subtitles
    Array.from(files.subtitles).forEach(file => payload.append('subtitles', file));
    // Append multiple audios
    Array.from(files.audios).forEach(file => payload.append('audios', file));
    
    if (formData.scheduledAt) payload.append('scheduledAt', formData.scheduledAt);
    if (formData.introStart) payload.append('introStart', formData.introStart);
    if (formData.introEnd) payload.append('introEnd', formData.introEnd);
    if (formData.outroStart) payload.append('outroStart', formData.outroStart);
    if (formData.outroEnd) payload.append('outroEnd', formData.outroEnd);

    try {
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
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.response?.data?.message || 'Pipeline Error: Failed to upload episode.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
            <Upload className="w-6 h-6" />
          </div>
          Upload Episode
        </h2>
        <p className="text-neutral-400 text-sm">Upload media files to trigger the FFmpeg encoding pipeline.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
              <Tv className="w-4 h-4" /> Series
            </label>
            <CustomSelect
              options={animesList?.map(a => ({ label: a.title, value: a._id })) || []}
              value={formData.anime}
              onChange={(val) => setFormData({ ...formData, anime: val })}
              placeholder="Select Target Anime..."
              searchable={true}
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:border-orange-500 text-white cursor-pointer transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ep. Number</label>
            <input 
              type="number" name="episodeNumber" value={formData.episodeNumber} onChange={handleInputChange} placeholder="e.g. 1" 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 text-white transition-colors" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ep. Title (Optional)</label>
            <input 
              type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Name of episode" 
              className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 text-white transition-colors" 
            />
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-neutral-950/30 border border-neutral-800/50 p-5 rounded-2xl">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" /> Skip Timestamps (Seconds)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['introStart', 'introEnd', 'outroStart', 'outroEnd'].map(field => (
              <div key={field} className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-600 uppercase">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input 
                  type="number" name={field} value={formData[field]} onChange={handleInputChange} placeholder="0" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-500 text-white transition-colors" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Media Uploads */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Media Assets</h4>
          
          <div 
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-300 ${dragActive ? 'border-orange-500 bg-orange-500/5 scale-[1.02]' : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-600'}`}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <input type="file" accept="video/*" onChange={e => setFiles({...files, video: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isUploading} />
            {files.video ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
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

        {/* Upload Progress */}
        {isUploading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full space-y-2">
            <div className="flex justify-between text-xs font-bold text-neutral-400 tracking-wider">
              <span>UPLOADING TO PIPELINE</span>
              <span className="text-orange-500">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
              <div style={{ width: `${uploadProgress}%` }} className="h-full bg-gradient-to-r from-orange-600 to-red-500 transition-all duration-300" />
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
            className="w-full py-4 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : 'Push to Pipeline'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}