import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchAnimes } from "../redux/slice/animeSlice"
import AnimeCard from "../components/Home/AnimeCard"
import QuickFilter from "../components/Home/QuickFilter"
import { Search as SearchIcon, Compass } from "lucide-react"

export default function Search() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { animeList, pagination, isLoading } = useSelector(
    (state) => state.anime,
  )

  const searchParams = new URLSearchParams(location.search)
  const sortParam = searchParams.get("sort")
  const queryParam = searchParams.get("q") || searchParams.get("search")
  const surpriseParam = searchParams.get("surprise")
  const genresParam = searchParams.get("genres")
  const yearParam = searchParams.get("year")
  const statusParam = searchParams.get("status")
  const pageParam = searchParams.get("page")

  const [localSearch, setLocalSearch] = useState(queryParam || "")
  const [surpriseHandled, setSurpriseHandled] = useState(false)

  useEffect(() => {
    // Determine fetch parameters based on URL query
    const params = { limit: 30 }
    if (pageParam) params.page = pageParam
    if (sortParam) params.sort = sortParam
    if (sortParam === "trending") params.sort = "rating" // mock mapping
    if (queryParam) params.search = queryParam
    if (genresParam) params.genres = genresParam
    if (yearParam) params.year = yearParam
    if (statusParam) params.status = statusParam

    dispatch(fetchAnimes(params))
    setSurpriseHandled(false) // Reset surprise handle state on new search
  }, [
    dispatch,
    sortParam,
    queryParam,
    surpriseParam,
    genresParam,
    yearParam,
    statusParam,
    pageParam,
  ])

  useEffect(() => {
    // If surprise me is active and data is loaded, pick one randomly and redirect!
    if (
      surpriseParam &&
      !isLoading &&
      animeList?.length > 0 &&
      !surpriseHandled
    ) {
      setSurpriseHandled(true)
      const randomAnime =
        animeList[Math.floor(Math.random() * animeList.length)]
      navigate(`/anime/${randomAnime._id}`, { replace: true })
    }
  }, [surpriseParam, isLoading, animeList, navigate, surpriseHandled])

  const handleSearch = (e) => {
    e.preventDefault()
    const newParams = new URLSearchParams(location.search)
    if (localSearch.trim()) {
      newParams.set("q", localSearch.trim())
      newParams.delete("search") // clean up old 'search' param if any
    } else {
      newParams.delete("q")
      newParams.delete("search")
    }
    newParams.set("page", "1") // reset page to 1 when searching
    navigate(`/search?${newParams.toString()}`)
  }

  const pageTitle = surpriseParam
    ? "Surprise Me!"
    : sortParam === "trending"
      ? "Trending Anime"
      : sortParam === "latest"
        ? "Latest Releases"
        : queryParam
          ? `Search Results for "${queryParam}"`
          : "Explore Anime"

  return (
    <div className="min-h-screen bg-[#0e0b12] text-white pt-[100px] pb-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f33767]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1500px] mx-auto flex flex-col xl:flex-row gap-8 items-start">
        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <h1 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
              <Compass className="text-[#f33767]" size={28} />
              {pageTitle}
            </h1>

            <form
              onSubmit={handleSearch}
              className="relative w-full md:w-80 group"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-[#f33767] transition-colors z-10">
                <SearchIcon size={18} />
              </div>
              <input
                type="text"
                placeholder="Search any anime..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-[#110e16]/80 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-black tracking-widest text-white focus:outline-none focus:border-[#f33767] focus:bg-[#f33767]/5 focus:shadow-[0_0_20px_rgba(243,55,103,0.2)] transition-all shadow-inner"
              />
            </form>
          </div>
          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="w-full aspect-[3/4] rounded-xl bg-white/5 animate-pulse border border-white/5"></div>
                  <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse mt-1"></div>
                </div>
              ))}
            </div>
          ) : animeList?.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {animeList.map((anime) => (
                  <AnimeCard key={anime._id} anime={anime} />
                ))}
              </div>

              {/* Pagination UI */}
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={!pageParam || pageParam === "1"}
                  onClick={() => {
                    const newParams = new URLSearchParams(location.search)
                    const currentPage = parseInt(pageParam) || 1
                    newParams.set("page", currentPage - 1)
                    navigate(`/search?${newParams.toString()}`)
                  }}
                  className="px-4 py-2 bg-[#1a1721] border border-white/10 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-[#201d2a] transition-colors"
                >
                  Prev
                </button>

                <span className="text-sm text-neutral-400 font-bold px-4">
                  Page {pageParam || "1"}{" "}
                  {pagination?.total
                    ? `of ${Math.ceil(pagination.total / (pagination.limit || 30))}`
                    : ""}
                </span>

                <button
                  disabled={
                    animeList.length < 30 ||
                    (pagination &&
                      pagination.page >=
                        Math.ceil(pagination.total / pagination.limit))
                  }
                  onClick={() => {
                    const newParams = new URLSearchParams(location.search)
                    const currentPage = parseInt(pageParam) || 1
                    newParams.set("page", currentPage + 1)
                    navigate(`/search?${newParams.toString()}`)
                  }}
                  className="px-4 py-2 bg-[#1a1721] border border-white/10 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-[#201d2a] transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center gap-4 bg-[#110e16] rounded-2xl border border-white/5 shadow-xl">
              <SearchIcon size={48} className="text-neutral-700" />
              <h2 className="text-xl font-bold text-neutral-400 uppercase tracking-widest">
                No anime found
              </h2>
              <p className="text-neutral-600 text-sm">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}
        </main>

        {/* Sidebar Filters */}
        <aside className="w-full xl:w-[320px] shrink-0 xl:sticky xl:top-[100px]">
          <QuickFilter />
        </aside>
      </div>
    </div>
  )
}
