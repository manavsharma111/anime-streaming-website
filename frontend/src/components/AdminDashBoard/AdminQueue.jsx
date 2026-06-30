import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, RefreshCw, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../services/api';
import socketService from '../../services/socketService';

export default function AdminQueue() {
  const [jobs, setJobs] = useState({ active: [], waiting: [], failed: [] });
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await axiosInstance.get('/anime-admin/queue');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch queue", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryJob = async (jobId) => {
    try {
      const res = await axiosInstance.post(`/anime-admin/queue/retry/${jobId}`);
      if (res.data.success) fetchQueue();
    } catch (err) {
      console.error("Failed to retry job", err);
      alert("Failed to retry job");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const res = await axiosInstance.delete(`/anime-admin/queue/${jobId}`);
      if (res.data.success) fetchQueue();
    } catch (err) {
      console.error("Failed to delete job", err);
      alert("Failed to delete job");
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Polling fallback

    const socket = socketService.getSocket();
    const onProgress = (data) => {
      setJobs(prev => {
        const newActive = prev.active.map(job => 
          job.data.episodeId === data.episodeId ? { ...job, progress: data.percent } : job
        );
        return { ...prev, active: newActive };
      });
    };

    socket.on("video_progress", onProgress);
    return () => {
      clearInterval(interval);
      socket.off("video_progress", onProgress);
    };
  }, []);

  const renderJobCard = (job, type) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      key={job.id} 
      className="bg-neutral-950/50 border border-white/5 rounded-2xl p-5 mb-4 shadow-lg relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-black text-white text-lg">Job #{job.id}</h4>
          <p className="text-neutral-400 text-sm mt-1 font-mono">Episode ID: {job.data?.episodeId}</p>
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${
          type === 'active' ? 'bg-indigo-500/10 text-indigo-400' :
          type === 'waiting' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {type}
        </div>
      </div>

      {type === 'active' && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Encoding Progress</span>
            <span className="text-sm font-black text-white">{job.progress || 0}%</span>
          </div>
          <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${job.progress || 0}%` }} transition={{ duration: 0.5 }}
              className="bg-indigo-500 h-2.5 rounded-full"
            ></motion.div>
          </div>
        </div>
      )}

      {type === 'failed' && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs font-mono text-red-400 break-words">{job.failedReason}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button 
              onClick={() => handleRetryJob(job.id)}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> Retry
            </button>
            <button 
              onClick={() => handleDeleteJob(job.id)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl flex flex-col gap-8 min-h-[80vh]"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Activity className="w-6 h-6" />
            </div>
            Processing Queue Monitor
          </h3>
          <p className="text-sm text-neutral-400 mt-2 tracking-wide">Real-time status of background FFMPEG encoding jobs.</p>
        </div>
        <button onClick={fetchQueue} className="p-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Active Jobs */}
        <div className="bg-black/20 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-indigo-400" size={20} />
            <h4 className="text-lg font-black text-white uppercase tracking-widest">Active ({jobs.active.length})</h4>
          </div>
          <div className="space-y-4">
            {jobs.active.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">No active processing jobs right now.</p>
            ) : (
              jobs.active.map(job => renderJobCard(job, 'active'))
            )}
          </div>
        </div>

        {/* Waiting Jobs */}
        <div className="bg-black/20 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-amber-400" size={20} />
            <h4 className="text-lg font-black text-white uppercase tracking-widest">Waiting ({jobs.waiting.length})</h4>
          </div>
          <div className="space-y-4">
            {jobs.waiting.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">Queue is empty.</p>
            ) : (
              jobs.waiting.map(job => renderJobCard(job, 'waiting'))
            )}
          </div>
        </div>

        {/* Failed Jobs */}
        <div className="bg-black/20 rounded-2xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="text-red-400" size={20} />
            <h4 className="text-lg font-black text-white uppercase tracking-widest">Failed ({jobs.failed.length})</h4>
          </div>
          <div className="space-y-4">
            {jobs.failed.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">No failed jobs. Awesome!</p>
            ) : (
              jobs.failed.map(job => renderJobCard(job, 'failed'))
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
