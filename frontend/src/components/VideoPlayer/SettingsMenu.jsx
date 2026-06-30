import React, { useState, useEffect } from 'react';
import { Settings, X, SignalHigh, Subtitles, Clock, Mic, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils/cn';

export default function SettingsMenu({ 
  showSettings, 
  setShowSettings,
  qualities = [], 
  audioTracks = [], 
  subtitleTracks = [],
  currentQuality, 
  currentAudio, 
  currentSubtitle,
  playbackSpeed, 
  onQualityChange, 
  onAudioChange, 
  onSubtitleChange,
  onSpeedChange,
  downloadQualities = {},
  videoUrl
}) {
  const [activeTab, setActiveTab] = useState('quality');

  const tabs = [
    { id: 'quality', icon: SignalHigh, show: true },
    { id: 'audio', icon: Mic, show: true },
    { id: 'subtitles', icon: Subtitles, show: true },
    { id: 'speed', icon: Clock, show: true },
    { id: 'download', icon: Download, show: true }
  ].filter(t => t.show);

  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab) && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const renderList = (items, currentId, onSelect, labelKey = 'name', idKey = 'id', emptyMessage = "Default") => (
    <div className="flex flex-col py-2 max-h-[150px] overflow-y-auto custom-scrollbar overscroll-contain pointer-events-auto">
      {items.length > 0 ? items.map(item => {
        const isActive = currentId === item[idKey];
        return (
          <button
            key={item[idKey]}
            onClick={() => onSelect(item[idKey])}
            className={cn(
              "text-left px-5 py-2 text-[13px] transition-colors flex items-center gap-3",
              isActive ? "text-white font-bold" : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
            )}
          >
            <span className="w-1.5 text-center leading-none text-[16px]">{isActive ? '•' : ''}</span>
            {item[labelKey] || `Track ${item[idKey]}`}
          </button>
        );
      }) : (
        <div className="text-left px-5 py-2 text-[13px] text-neutral-500">{emptyMessage}</div>
      )}
    </div>
  );

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace('/api', '') : 'http://localhost:8080';
    return `${backendUrl}${url}`;
  };

  // FAKE DATA FOR UI DEMONSTRATION IF ACTUAL HLS DATA IS MISSING
  const displayAudioTracks = audioTracks.length > 0 ? audioTracks : [
    { id: 0, name: 'Japanese (Original)' },
    { id: 1, name: 'English (Dub)' },
    { id: 2, name: 'Hindi (Dub)' }
  ];

  const displaySubtitleTracks = subtitleTracks.length > 1 ? subtitleTracks : [
    { id: -1, name: 'Off' },
    { id: 0, name: 'English (CC)' },
    { id: 1, name: 'Spanish' },
    { id: 2, name: 'Hindi' }
  ];

  const displayDownloadQualities = Object.keys(downloadQualities || {}).length > 0 
    ? downloadQualities 
    : {
        '1080p (FHD)': videoUrl,
        '720p (HD)': videoUrl,
        '480p (SD)': videoUrl
      };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={cn(
          "text-white hover:text-[#ff5722] transition-all p-2 rounded-full",
          showSettings && "text-[#ff5722]"
        )}
      >
        <Settings size={20} />
      </button>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-10 right-0 w-[280px] bg-[#1c1c1c]/95 backdrop-blur-md rounded shadow-2xl z-50 flex flex-col border border-white/10 overflow-hidden"
          >
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-2 pt-2 border-b border-white/10">
              <div className="flex gap-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "p-3 border-b-2 transition-colors",
                        isActive ? "border-white text-white" : "border-transparent text-neutral-400 hover:text-neutral-200"
                      )}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-3 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="py-2">
              {activeTab === 'quality' && renderList(qualities.length > 0 ? qualities : [{id: -1, name: 'Auto (1080p)'}, {id: 2, name: '1080p'}, {id: 1, name: '720p'}], currentQuality, onQualityChange, 'name', 'id', 'Auto (Default)')}
              {activeTab === 'audio' && renderList(displayAudioTracks, currentAudio, onAudioChange, 'name', 'id', 'Default Track')}
              {activeTab === 'subtitles' && renderList(displaySubtitleTracks, currentSubtitle, onSubtitleChange, 'name', 'id', 'Off')}
              
              {activeTab === 'speed' && (
                <div className="px-5 py-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-neutral-400 text-[12px] font-medium">
                    <span>0.25x</span>
                    <span className="text-white font-bold text-[14px]">
                      {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}
                    </span>
                    <span>2x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.25" max="2" step="0.05" 
                    value={playbackSpeed}
                    onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              )}

              {activeTab === 'download' && (
                <div className="flex flex-col py-2 max-h-[200px] overflow-y-auto">
                  {Object.entries(displayDownloadQualities).map(([quality, url]) => (
                    <a
                      key={quality}
                      href={getFullUrl(url)}
                      download={`Episode_${quality}.mp4`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-left px-5 py-3 text-[13px] font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">{quality}</span>
                      <Download size={16} className="opacity-70 group-hover:opacity-100 group-hover:text-[#ff5722] transition-all" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
