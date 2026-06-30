import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnimeDetails, clearAnimeDetails } from '../../redux/slice/animeSlice';
import { Play, Heart, Share2, Star, Download, ChevronRight, MessageSquare, PlayCircle, Plus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../utils/image';
import ReviewSection from '../../components/Anime/ReviewSection/ReviewSection';
import AnimeInfoBox from '../../components/Watch/AnimeInfoBox';
import TrendingSidebar from '../../components/Watch/TrendingSidebar';

export default function AnimeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { animeDetails, isLoading, error } = useSelector((state) => state.anime);
  const { reviews } = useSelector((state) => state.review);

  useEffect(() => {
    dispatch(fetchAnimeDetails(id));
    return () => {
      dispatch(clearAnimeDetails());
    };
  }, [dispatch, id]);

  if (isLoading || !animeDetails) {
    return (
      <div className="min-h-screen bg-[#110e16] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#f33767] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#110e16] flex justify-center items-center text-white">
        <h2>Error loading anime details: {error}</h2>
      </div>
    );
  }

  const anime = animeDetails;
  const episodes = anime.episodes || [];

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : (anime.rating || 0).toFixed(1);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };
  const trailerId = getYoutubeId(anime.trailerUrl);

  return (
    <div className="min-h-screen bg-[#0e0b12] text-white pt-24 pb-20 relative overflow-hidden font-sans">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#f33767]/10 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Background Video */}
      <div className="absolute top-0 left-0 w-full h-[90vh] overflow-hidden pointer-events-none z-0">
        {trailerId ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&loop=1&playlist=${trailerId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0`}
            allow="autoplay; encrypted-media"
            className="w-full h-[120%] object-cover opacity-40 pointer-events-none scale-[1.3] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
            style={{ border: 'none' }}
            tabIndex="-1"
          ></iframe>
        ) : (
          <video
            autoPlay loop muted playsInline controls={false}
            className="w-full h-full object-cover opacity-30 absolute top-0 left-0 z-0 pointer-events-none"
            style={{ pointerEvents: 'none' }}
            src="https://assets.mixkit.co/videos/preview/mixkit-animation-of-futuristic-devices-99786-large.mp4"
          ></video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0b12]/30 via-[#0e0b12]/60 to-[#0e0b12] z-10"></div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 relative z-10 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <main className="flex flex-col gap-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-2 font-bold text-sm w-fit bg-white/5 px-4 py-2 rounded-lg"
          >
            <ArrowLeft size={16} /> Back to browsing
          </button>

          {/* Anime Info Box */}
          <AnimeInfoBox anime={anime} />

          {/* EPISODES (Grid for landing page) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 bg-[#110e16] p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Episodes</h3>
              <span className="text-xs font-bold text-neutral-500">{episodes.length} Episodes</span>
            </div>

            {episodes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {episodes.map((ep, idx) => (
                  <Link
                    to={`/watch/${ep._id}`}
                    state={{ anime, episode: ep }}
                    key={ep._id}
                    className="flex flex-col gap-2 p-2 rounded-xl bg-[#1c1c1c] border border-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shrink-0">
                      <img 
                        src={getImageUrl(ep.thumbnailUrl || anime.cover || anime.thumbnail)} 
                        alt={ep.title} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getImageUrl(anime.cover || anime.thumbnail);
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={24} className="text-white fill-white" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                        Ep {ep.episodeNumber}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden px-1 pb-1">
                      <h4 className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors truncate">
                        {ep.title || `Episode ${ep.episodeNumber}`}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#1c1c1c] rounded-xl border border-white/5">
                <p className="text-neutral-500 text-sm font-bold">No episodes available yet.</p>
              </div>
            )}
          </motion.div>

          <ReviewSection animeId={anime._id} />
        </main>

        <TrendingSidebar />
      </div>
    </div>
    // </div>

  );
}