import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToHistory } from '../redux/slice/historySlice';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import axiosInstance from '../services/api';
import AnimeSidebar from '../components/Watch/AnimeSidebar';
import PlayerToolbar from '../components/Watch/PlayerToolbar';
import EpisodeListSidebar from '../components/Watch/EpisodeListSidebar';
import AnimeInfoBox from '../components/Watch/AnimeInfoBox';
import TrendingSidebar from '../components/Watch/TrendingSidebar';

export default function Watch() {
  const { episodeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { history } = useSelector((state) => state.history);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Retrieve episode and anime data from router state
  const episode = location.state?.episode;
  const anime = location.state?.anime;

  const [autoNext, setAutoNext] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoSkip, setAutoSkip] = useState(false);
  const [activeServer, setActiveServer] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [searchEpisode, setSearchEpisode] = useState('');

  // Derive episodes list and current index for Next/Prev functionality
  const episodesList = anime?.episodes || [];
  const currentIndex = episodesList.findIndex(e => {
    const id = typeof e === 'object' ? e._id : e;
    return id === episode?._id;
  });

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevEp = episodesList[currentIndex - 1];
      navigate(`/watch/${prevEp._id || prevEp}`, { state: { episode: prevEp, anime } });
    }
  };

  const handleSelectEpisode = (ep) => {
    navigate(`/watch/${ep._id || ep}`, { state: { episode: ep, anime } });
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < episodesList.length - 1) {
      const nextEp = episodesList[currentIndex + 1];
      navigate(`/watch/${nextEp._id || nextEp}`, { state: { episode: nextEp, anime } });
    }
  };

  const handleVideoEnded = () => {
    if (autoNext) {
      handleNext();
    }
  };

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#0e0b12] flex flex-col items-center justify-center text-white font-bold gap-4">
        <h2 className="text-xl">Episode data not found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-[#f33767] rounded-xl uppercase tracking-widest text-xs font-black shadow-[0_0_15px_rgba(243,55,103,0.3)]">Go Back</button>
      </div>
    );
  }

  // Determine the correct stream URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace('/api', '') : 'http://localhost:8080';
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${backendUrl}${url}`;
  };

  const streamUrl = episode.hlsMasterUrl 
    ? getFullUrl(episode.hlsMasterUrl) 
    : getFullUrl(episode.videoUrl);

  const episodeData = {
    introStart: episode.introStart || 0,
    introEnd: episode.introEnd || 0,
    outroStart: episode.outroStart || 0,
    outroEnd: episode.outroEnd || 0,
    downloadQualities: episode.downloadQualities,
    videoUrl: episode.videoUrl,
    subtitleTracks: episode.subtitleTracks || []
  };

  const hasTrackedView = useRef(false);

  // Resume logic
  const historyItem = history?.find((item) => 
    (item.anime?._id || item.anime) === (anime?._id || anime)
  );
  const isSameEpisode = (historyItem?.episode?._id || historyItem?.episode) === episode?._id;
  const initialTime = isSameEpisode ? historyItem?.watchTime || 0 : 0;

  const handleProgressSync = (seconds, duration) => {
    if (seconds > 5 && !hasTrackedView.current) {
      hasTrackedView.current = true;
      axiosInstance.post(`/anime/view/${episode._id}`).catch(err => console.error(err));
    }

    // Save history every 10 seconds via Redux thunk (backend will upsert)
    if (isAuthenticated && seconds > 0) {
      dispatch(addToHistory({
        anime: anime?._id,
        episode: episode?._id,
        watchTime: seconds,
        totalDuration: duration,
        progress: duration > 0 ? (seconds / duration) * 100 : 0,
        completed: duration > 0 && (seconds / duration) > 0.9
      }));
    }
  };



  return (
    <div className="min-h-screen bg-[#0e0b12] pt-[100px] pb-12 w-full px-4 overflow-x-hidden relative">
      {/* Abstract Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[500px] bg-[#f33767]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-[1700px] mx-auto grid grid-cols-1 xl:grid-cols-[300px_1fr_320px] gap-6 items-start">
        
        {/* LEFT COLUMN: Episodes List */}
        <div className="order-2 xl:order-none xl:col-start-1 xl:row-start-1 xl:row-span-2">
          <EpisodeListSidebar 
            searchEpisode={searchEpisode} setSearchEpisode={setSearchEpisode}
            episodesList={episodesList} episode={episode}
            handleSelectEpisode={handleSelectEpisode}
          />
        </div>

        {/* MIDDLE COLUMN TOP: Video Player & Toolbar */}
        <div className="order-1 xl:order-none xl:col-start-2 xl:row-start-1">
          <main className="flex flex-col shadow-2xl bg-[#1c1c1c] rounded-2xl border border-white/5 relative z-10">
            {/* Focus Mode Overlay */}
            {isFocused && (
              <div 
                className="fixed inset-0 bg-black/95 backdrop-blur-md z-40 transition-opacity cursor-pointer" 
                onClick={() => setIsFocused(false)}
              />
            )}

            <div className={`w-full aspect-video bg-black relative ${isFocused ? 'z-50 shadow-[0_0_100px_rgba(243,55,103,0.15)] ring-1 ring-[#f33767]/30 rounded-2xl' : ''}`}>
              <VideoPlayer 
                streamUrl={streamUrl} 
                title={`Episode ${episode.episodeNumber} - ${episode.title || ''}`}
                episodeData={episodeData} 
                initialTime={initialTime}
                onProgressSync={handleProgressSync} 
                onBack={() => navigate(-1)}
                autoPlay={autoPlay}
                autoSkip={autoSkip}
                onEnded={handleVideoEnded}
              />
            </div>

            <PlayerToolbar 
              isFocused={isFocused} setIsFocused={setIsFocused}
              autoNext={autoNext} setAutoNext={setAutoNext}
              autoPlay={autoPlay} setAutoPlay={setAutoPlay}
              autoSkip={autoSkip} setAutoSkip={setAutoSkip}
              activeServer={activeServer} setActiveServer={setActiveServer}
              handlePrev={handlePrev} handleNext={handleNext} 
              currentIndex={currentIndex} episodesList={episodesList}
              episode={episode} backendUrl={backendUrl}
            />
          </main>
        </div>

        {/* MIDDLE COLUMN BOTTOM: Anime Info Box */}
        <div className="order-3 xl:order-none xl:col-start-2 xl:row-start-2">
          <AnimeInfoBox anime={anime} />
        </div>

        {/* RIGHT COLUMN: Trending / Recommendations */}
        <div className="order-4 xl:order-none xl:col-start-3 xl:row-start-1 xl:row-span-2">
          <TrendingSidebar />
        </div>

      </div>

    </div>
  );
}
