import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getWishlist } from "../../redux/slice/wishlistSlice"
import AnimeCard from "../../components/Home/AnimeCard"
import { Heart, Loader, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Navigate } from "react-router-dom"

export default function Wishlist() {
  const dispatch = useDispatch()
  const { wishlist, isLoading } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  
  const itemsPerPage = 12

  const tabs = ["All", "Watching", "Completed", "Planning", "Paused", "Dropped"]
  
  const sortOptions = [
    { value: "newest", label: "Recently Added" },
    { value: "oldest", label: "Oldest Added" },
    { value: "alphabetical", label: "Alphabetical" },
  ]

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWishlist())
    }
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/" />
  }

  // Filter and Sort
  let processedWishlist = [...(wishlist || [])]
  
  if (activeTab !== "All") {
    processedWishlist = processedWishlist.filter(item => item.status === activeTab)
  }

  processedWishlist.sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.addedAt) - new Date(a.addedAt)
    } else if (sortBy === "oldest") {
      return new Date(a.addedAt) - new Date(b.addedAt)
    } else if (sortBy === "alphabetical") {
      const titleA = a.anime?.title || ""
      const titleB = b.anime?.title || ""
      return titleA.localeCompare(titleB)
    }
    return 0
  })

  const totalPages = Math.ceil(processedWishlist.length / itemsPerPage)
  
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

  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const visibleWishlist = processedWishlist.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen bg-[#0e0b12] text-white pt-24 pb-32 md:pb-10 px-4 md:px-8 relative">
      <div className="max-w-full mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-white/5 pb-4">
          <Heart size={32} className="text-[#f33767] shrink-0" fill="#f33767" />
          <h1 className="text-3xl font-black uppercase tracking-wider">
            My Anime List
          </h1>
          <span className="ml-2 text-neutral-400 bg-white/5 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap shrink-0">
            {processedWishlist.length} Items
          </span>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-bold outline-none border-none transition-colors ${
                  activeTab === tab 
                    ? "bg-[#f33767] text-white" 
                    : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 relative">
            <span className="text-sm font-bold text-neutral-500 uppercase">Sort By:</span>
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center justify-between gap-2 bg-[#1a1721] border border-white/10 hover:border-[#f33767] text-white text-sm rounded-lg py-2 px-3 outline-none min-w-[160px] transition-colors"
              >
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isSortDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isSortDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-full bg-[#1a1721] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setCurrentPage(1);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === option.value
                          ? "bg-[#f33767]/10 text-[#f33767] font-bold"
                          : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size={48} className="animate-spin text-[#f33767]" />
          </div>
        ) : processedWishlist && processedWishlist.length > 0 ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
              {visibleWishlist.map((item) => {
                if (!item.anime) return null
                return <AnimeCard key={item._id} anime={item.anime} />
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 sm:gap-3 mt-12 mb-4 flex-wrap">
                {/* First Page */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(1)}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#1e1c22] hover:bg-[#2a2730] rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1e1c22] disabled:hover:text-neutral-400 transition-all shadow-sm"
                >
                  <ChevronsLeft size={18} />
                </button>

                {/* Previous Page */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#1e1c22] hover:bg-[#2a2730] rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1e1c22] disabled:hover:text-neutral-400 transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Numbers */}
                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePageChange(num)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#1e1c22] hover:bg-[#2a2730] rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1e1c22] disabled:hover:text-neutral-400 transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
                
                {/* Last Page */}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#1e1c22] hover:bg-[#2a2730] rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:bg-[#1e1c22] disabled:hover:text-neutral-400 transition-all shadow-sm"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white/5 rounded-2xl border border-white/5">
            <Heart size={64} className="text-neutral-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No anime found here</h2>
            <p className="text-neutral-400 max-w-md">
              {activeTab === "All" 
                ? "Keep track of anime you want to watch by clicking the Add to List button on any anime page." 
                : `You don't have any anime in the "${activeTab}" list.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
