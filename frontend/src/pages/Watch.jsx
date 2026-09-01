import React, { useState, useEffect, useRef } from "react"
import { useLocation, useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { addToHistory, getWatchHistory } from "../redux/slice/historySlice"
import { fetchAnimes, fetchAnimeDetails } from "../redux/slice/animeSlice"
import VideoPlayer from "../components/VideoPlayer/VideoPlayer"
import axiosInstance from "../services/api"
import AnimeSidebar from "../components/Watch/AnimeSidebar"
import PlayerToolbar from "../components/Watch/PlayerToolbar"
import EpisodeListSidebar from "../components/Watch/EpisodeListSidebar"
import AnimeInfoBox from "../components/Watch/AnimeInfoBox"
import TrendingSidebar from "../components/Watch/TrendingSidebar"

export default function Watch() {
  const { episodeId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { history } = useSelector((state) => state.history)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { animeList, isLoading, animeDetails } = useSelector(
    (state) => state.anime,
  )

  // Retrieve episode and anime data from router state
  let episode = location.state?.episode
  let anime = location.state?.anime
  const fetchAnimeId = location.state?.fetchAnimeId

  // Fallback 1: if we are asked to fetch a specific anime (from Continue Watching)
  if (
    !episode &&
    fetchAnimeId &&
    animeDetails &&
    animeDetails._id === fetchAnimeId
  ) {
    anime = animeDetails
    episode = animeDetails.episodes?.find((e) => (e._id || e) === episodeId)
  }

  // Fallback 2: if state is lost (e.g. page refresh), try to find from Redux animeList
  if (!episode && animeList.length > 0) {
    for (const a of animeList) {
      const ep = a.episodes?.find((e) => (e._id || e) === episodeId)
      if (ep) {
        anime = a
        episode = ep
        break
      }
    }
  }

  const [autoNext, setAutoNext] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const [autoSkip, setAutoSkip] = useState(false)
  const [activeServer, setActiveServer] = useState(1)
  const [isFocused, setIsFocused] = useState(false)
  const [searchEpisode, setSearchEpisode] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWatchHistory())
    }

    if (!episode) {
      if (
        fetchAnimeId &&
        (!animeDetails || animeDetails._id !== fetchAnimeId)
      ) {
        // Fetch the specific anime required by the history link
        dispatch(fetchAnimeDetails(fetchAnimeId))
      } else if (!fetchAnimeId && animeList.length === 0) {
        // If no episode is found and we haven't fetched animes yet, fetch them to populate fallback
        dispatch(fetchAnimes({ limit: 1000 }))
      }
    }
  }, [
    dispatch,
    isAuthenticated,
    episodeId,
    episode,
    animeList.length,
    fetchAnimeId,
    animeDetails?._id,
  ])

  // Derive episodes list and current index for Next/Prev functionality
  const episodesList = anime?.episodes || []
  const currentIndex = episodesList.findIndex((e) => {
    const id = typeof e === "object" ? e._id : e
    return id === episode?._id
  })

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevEp = episodesList[currentIndex - 1]
      navigate(`/watch/${prevEp._id || prevEp}`, {
        state: { episode: prevEp, anime },
      })
    }
  }

  const handleSelectEpisode = (ep) => {
    navigate(`/watch/${ep._id || ep}`, { state: { episode: ep, anime } })
  }

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < episodesList.length - 1) {
      const nextEp = episodesList[currentIndex + 1]
      navigate(`/watch/${nextEp._id || nextEp}`, {
        state: { episode: nextEp, anime },
      })
    }
  }

  const hasTrackedView = useRef(false)

  const handleVideoEnded = () => {
    if (autoNext) {
      handleNext()
    }
  }

  if (!episode) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#0e0b12] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[#f33767] rounded-full animate-spin"></div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-[#0e0b12] flex flex-col items-center justify-center text-white font-bold gap-4">
        <h2 className="text-xl">Episode data not found</h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-[#f33767] rounded-xl uppercase tracking-widest text-xs font-black shadow-[0_0_15px_rgba(243,55,103,0.3)]"
        >
          Go Home
        </button>
      </div>
    )
  }

  // Determine the correct stream URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL
    ? import.meta.env.VITE_BACKEND_URL.replace("/api", "")
    : "http://localhost:8080"
  const getFullUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${backendUrl}${url}`
  }

  const streamUrl = episode.hlsMasterUrl
    ? getFullUrl(episode.hlsMasterUrl)
    : getFullUrl(episode.videoUrl)

  const episodeData = {
    introStart: episode.introStart || 0,
    introEnd: episode.introEnd || 0,
    outroStart: episode.outroStart || 0,
    outroEnd: episode.outroEnd || 0,
    downloadQualities: episode.downloadQualities,
    videoUrl: episode.videoUrl,
    subtitleTracks: episode.subtitleTracks || [],
  }

  // Resume logic
  const historyItem = history?.find(
    (item) => (item.anime?._id || item.anime) === (anime?._id || anime),
  )
  const isSameEpisode =
    (historyItem?.episode?._id || historyItem?.episode) === episode?._id
  const initialTime = isSameEpisode ? historyItem?.watchTime || 0 : 0

  const handleProgressSync = (seconds, duration) => {
    if (seconds > 5 && !hasTrackedView.current) {
      hasTrackedView.current = true
      axiosInstance
        .post(`/anime/view/${episode._id}`)
        .catch((err) => console.error(err))
    }

    // Save history every 10 seconds via Redux thunk (backend will upsert)
    if (isAuthenticated && seconds > 0) {
      dispatch(
        addToHistory({
          anime: anime?._id,
          episode: episode?._id,
          watchTime: seconds,
          totalDuration: duration,
          progress: duration > 0 ? (seconds / duration) * 100 : 0,
          completed: duration > 0 && seconds / duration > 0.9,
        }),
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0b12] pt-[80px] pb-12 w-full px-4 overflow-x-hidden relative font-sans">
      {/* Dynamic Background Image */}
      {anime?.cover || anime?.thumbnail ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-[100px] pointer-events-none -z-10"
          style={{ backgroundImage: `url(${getImageUrl(anime.cover || anime.thumbnail)})` }}
        />
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[500px] bg-[#f33767]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute top-[40%] right-[-10%] w-[30%] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        </>
      )}

      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_320px] gap-6 items-start relative z-10">
        
        {/* LEFT COLUMN: Anime Info Box */}
        <div className="order-2 lg:order-1 xl:order-1">
          <AnimeInfoBox anime={anime} />
        </div>

        {/* MIDDLE COLUMN: Video Player & Toolbar */}
        <div className="order-1 lg:order-2 xl:order-2 flex flex-col gap-4">
          <main className="flex flex-col shadow-2xl bg-[#13151a] rounded-xl border border-white/5 relative z-10 overflow-hidden">
            {/* Breadcrumb Header */}
            <div className="px-5 py-4 flex items-center gap-2 text-[13px] font-medium text-neutral-400">
              <span className="text-white flex items-center gap-1 cursor-pointer hover:text-[#f33767] transition-colors" onClick={() => navigate("/")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.99 9a.75.75 0 1 1-1.04 1.081L20 13.439V21a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-7.561l-.48.483a.75.75 0 0 1-1.04-1.08l8.99-9Z"/></svg>
                Home
              </span>
              <span>/</span>
              <span className="text-white cursor-pointer hover:text-[#f33767] transition-colors">{anime?.title}</span>
              <span>/</span>
              <span>Episode {episode.episodeNumber}</span>
            </div>

            {/* Focus Mode Overlay */}
            {isFocused && (
              <div
                className="fixed inset-0 bg-black/95 backdrop-blur-md z-40 transition-opacity cursor-pointer"
                onClick={() => setIsFocused(false)}
              />
            )}

            <div
              className={`w-full aspect-video bg-black relative ${isFocused ? "z-50 shadow-[0_0_100px_rgba(243,55,103,0.15)] ring-1 ring-[#f33767]/30 rounded-xl" : ""}`}
            >
              <VideoPlayer
                streamUrl={streamUrl}
                title={`Episode ${episode.episodeNumber} - ${episode.title || ""}`}
                episodeData={episodeData}
                initialTime={initialTime}
                onProgressSync={handleProgressSync}
                onBack={() => navigate(-1)}
                autoPlay={autoPlay}
                autoSkip={autoSkip}
                hasNextEpisode={currentIndex < episodesList.length - 1}
                autoNext={autoNext}
                onPlayNext={handleNext}
                onEnded={handleVideoEnded}
              />
            </div>

            <PlayerToolbar
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              autoNext={autoNext}
              setAutoNext={setAutoNext}
              autoPlay={autoPlay}
              setAutoPlay={setAutoPlay}
              autoSkip={autoSkip}
              setAutoSkip={setAutoSkip}
              activeServer={activeServer}
              setActiveServer={setActiveServer}
              handlePrev={handlePrev}
              handleNext={handleNext}
              currentIndex={currentIndex}
              episodesList={episodesList}
              episode={episode}
              backendUrl={backendUrl}
            />
          </main>
        </div>

        {/* RIGHT COLUMN: Episodes List */}
        <div className="order-3 lg:col-span-2 xl:col-span-1 xl:order-3">
          <EpisodeListSidebar
            searchEpisode={searchEpisode}
            setSearchEpisode={setSearchEpisode}
            episodesList={episodesList}
            episode={episode}
            handleSelectEpisode={handleSelectEpisode}
          />
        </div>

      </div>
    </div>
  )
}
