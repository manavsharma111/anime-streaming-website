import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchAnimes } from "../redux/slice/animeSlice"
import AnimeCard from "../components/Home/AnimeCard"
import QuickFilter from "../components/Home/QuickFilter"
import { Search as SearchIcon, Compass, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

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

  // Debounce search as you type
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (queryParam || "")) {
        const newParams = new URLSearchParams(location.search)
        if (localSearch.trim()) {
          newParams.set("q", localSearch.trim())
          newParams.delete("search")
        } else {
          newParams.delete("q")
          newParams.delete("search")
        }
        newParams.set("page", "1")
        navigate(`/search?${newParams.toString()}`)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [localSearch, queryParam, location.search, navigate])

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

  const currentPage = parseInt(pageParam) || 1
  // Use actual data if available, but ensure at least 5 pages are shown for the UI design
  const actualTotalPages = pagination?.total ? Math.ceil(pagination.total / (pagination.limit || 30)) : 1
  const totalPages = Math.max(5, actualTotalPages)
  
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      let start = Math.max(1, currentPage - 2)
      let end = Math.min(totalPages, start + maxVisible - 1)
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) pages.push(i)
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f33767]/5 blur-[60px] md:blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[60px] md:blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1500px] mx-auto flex flex-col xl:flex-row gap-8 items-start px-4 md:px-8">
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
              <div className="flex justify-center items-center gap-2 sm:gap-3 mt-12 mb-4 flex-wrap">
                {/* First Page */}
                <button
                  disabled={!pageParam || pageParam === "1"}
                  onClick={() => {
                    const newParams = new URLSearchParams(location.search)
                    newParams.set("page", 1)
                    navigate(`/search?${newParams.toString()}`)
                  }}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#1e1c22] hover:bg-[#2a2730] rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1e1c22] disabled:hover:text-neutral-400 transition-all shadow-sm"
                >
                  <ChevronsLeft size={18} />
                </button>

                {/* Previous Page */}
                <button
                  disabled={!pageParam || pageParam === "1"}
                  onClick={() => {
                    const newParams = new URLSearchParams(location.search)
                    const currentPage = parseInt(pageParam) || 1
                    newParams.set("page", currentPage - 1)
                    navigate(`/search?${newParams.toString()}`)
                  }}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#1e1c22] hover:bg-[#2a2730] rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1e1c22] disabled:hover:text-neutral-400 transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Numbers */}
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      if (num === currentPage) return
                      const newParams = new URLSearchParams(location.search)
                      newParams.set("page", num)
                      navigate(`/search?${newParams.toString()}`)
                    }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full font-bold text-sm sm:text-base transition-all duration-300 shadow-sm ${
                      currentPage === num
                        ? "bg-[#ffe082] text-[#110e16] scale-105 cursor-default shadow-[0_0_15px_rgba(255,224,130,0.3)]"
                        : "bg-[#1e1c22] text-neutral-400 hover:text-white hover:bg-[#2a2730]"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                {/* Next Page */}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    const newParams = new URLSearchParams(location.search)
                    const currentPage = parseInt(pageParam) || 1
                    newParams.set("page", currentPage + 1)
                    navigate(`/search?${newParams.toString()}`)
                  }}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#1e1c22] hover:bg-[#2a2730] rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1e1c22] disabled:hover:text-neutral-400 transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
                
                {/* Last Page */}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    const newParams = new URLSearchParams(location.search)
                    newParams.set("page", totalPages)
                    navigate(`/search?${newParams.toString()}`)
                  }}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#1e1c22] hover:bg-[#2a2730] rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1e1c22] disabled:hover:text-neutral-400 transition-all shadow-sm"
                >
                  <ChevronsRight size={18} />
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
