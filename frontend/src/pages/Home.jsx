import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAnimes, fetchMalTrending } from "../redux/slice/animeSlice"
import HeroCarousel from "../components/Home/HeroCarousel"
import QuickFilter from "../components/Home/QuickFilter"
import TopAnime from "../components/Home/TopAnime"
import ContinueWatching from "../components/Home/ContinueWatching"
import AnimeSection from "../components/Home/AnimeSection"
import AnimeListCard from "../components/Home/AnimeListCard"
import { Flame, Clock, Sparkles, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { animeList, malTrendingList, isLoading } = useSelector((state) => state.anime)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchAnimes({ limit: 20 }))
    dispatch(fetchMalTrending())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      import("../redux/slice/historySlice").then(({ getWatchHistory }) => {
        dispatch(getWatchHistory())
      })
    }
  }, [dispatch, isAuthenticated])

  // Split anime into trending and latest (mock separation)
  const trendingAnime = animeList?.slice(0, 10) || []
  const latestAnime = animeList?.slice(10, 20) || []
  const recommendedAnime = animeList?.slice(5, 15) || []

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 overflow-x-hidden relative">
      {/* Decorative background blurs */}
      <div className="absolute top-40 left-[-20%] w-[50%] h-[500px] bg-[#f33767]/5 blur-[60px] md:blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-40 right-[-10%] w-[40%] h-[400px] bg-purple-500/5 blur-[50px] md:blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1500px] mx-auto flex flex-col xl:flex-row items-start gap-8 px-4 md:px-8">
        {/* LEFT COLUMN: Main Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-10">
          {/* Hero Section */}
          <section className="mb-4">
            <HeroCarousel animes={animeList} />
          </section>

          {/* Continue Watching (Only shows if logged in with history) */}
          <ContinueWatching />

          {/* Trending Now */}
          <AnimeSection
            title="Trending Now"
            icon={Flame}
            animes={trendingAnime}
            isLoading={isLoading}
            viewAllLink="/search?sort=trending"
          />

          {/* Currently Airing (MAL Proxy) */}
          {malTrendingList && malTrendingList.length > 0 && (
            <AnimeSection
              title="🔥 Currently Airing (MAL)"
              icon={Sparkles}
              animes={malTrendingList}
              isLoading={isLoading}
            />
          )}

          {/* Latest Episode */}
          <AnimeSection
            title="Latest Episode"
            icon={Clock}
            animes={latestAnime}
            isLoading={isLoading}
          />

          {/* Three-Column Lists Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
            {/* New Release */}
            <div className="flex flex-col gap-4">
              <div
                className="flex items-center gap-1 group cursor-pointer w-fit hover:text-white text-neutral-300 transition-colors"
                onClick={() => navigate("/search?sort=latest")}
              >
                <h3 className="font-black text-sm tracking-widest uppercase">
                  NEW RELEASE
                </h3>
                <ChevronRight
                  size={16}
                  className="text-neutral-500 group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                {animeList?.slice(0, 5).map((anime) => (
                  <AnimeListCard key={anime._id} anime={anime} />
                ))}
              </div>
            </div>
            {/* New Added */}
            <div className="flex flex-col gap-4">
              <div
                className="flex items-center gap-1 group cursor-pointer w-fit hover:text-white text-neutral-300 transition-colors"
                onClick={() => navigate("/search?sort=latest")}
              >
                <h3 className="font-black text-sm tracking-widest uppercase">
                  NEW ADDED
                </h3>
                <ChevronRight
                  size={16}
                  className="text-neutral-500 group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                {animeList?.slice(5, 10).map((anime) => (
                  <AnimeListCard key={anime._id} anime={anime} />
                ))}
              </div>
            </div>
            {/* Just Completed */}
            <div className="flex flex-col gap-4">
              <div
                className="flex items-center gap-1 group cursor-pointer w-fit hover:text-white text-neutral-300 transition-colors"
                onClick={() => navigate("/search?status=Completed")}
              >
                <h3 className="font-black text-sm tracking-widest uppercase">
                  JUST COMPLETED
                </h3>
                <ChevronRight
                  size={16}
                  className="text-neutral-500 group-hover:text-white transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                {animeList?.slice(10, 15).map((anime) => (
                  <AnimeListCard key={anime._id} anime={anime} />
                ))}
              </div>
            </div>
          </section>

          {/* Recommended For You */}
          <AnimeSection
            title="Recommended"
            icon={Sparkles}
            animes={recommendedAnime}
            isLoading={isLoading}
          />
        </main>

        {/* RIGHT COLUMN: Widgets */}
        <aside className="w-full xl:w-[340px] flex-shrink-0 flex flex-col gap-8 xl:sticky xl:top-[90px]">
          <QuickFilter />
          <TopAnime />
        </aside>
      </div>
    </div>
  )
}
