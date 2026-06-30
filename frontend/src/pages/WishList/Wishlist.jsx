import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getWishlist } from "../../redux/slice/wishlistSlice"
import AnimeCard from "../../components/Home/AnimeCard"
import { Heart, Loader } from "lucide-react"
import { Navigate } from "react-router-dom"

export default function Wishlist() {
  const dispatch = useDispatch()
  const { wishlist, isLoading } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getWishlist())
    }
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/" /> // Or show a login prompt instead
  }

  const [visibleCount, setVisibleCount] = useState(12)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12)
  }

  const visibleWishlist = wishlist?.slice(0, visibleCount) || []

  return (
    <div className="min-h-screen bg-[#0e0b12] text-white pt-24 pb-32 md:pb-10 px-4 md:px-8 relative">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
          <Heart size={32} className="text-[#f33767]" fill="#f33767" />
          <h1 className="text-3xl font-black uppercase tracking-wider">
            My Watchlist
          </h1>
          <span className="ml-2 text-neutral-400 bg-white/5 px-3 py-1 rounded-full text-sm font-bold">
            {wishlist?.length || 0} Items
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size={48} className="animate-spin text-[#f33767]" />
          </div>
        ) : wishlist && wishlist.length > 0 ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
              {visibleWishlist.map((item) => {
                if (!item.anime) return null
                return <AnimeCard key={item._id} anime={item.anime} />
              })}
            </div>

            {(visibleCount < wishlist.length || visibleCount > 12) && (
              <div className="flex justify-center gap-4">
                {visibleCount < wishlist.length && (
                  <button
                    onClick={handleLoadMore}
                    className="text-xs font-bold uppercase tracking-widest text-white border border-white/10 hover:border-[#f33767] hover:text-[#f33767] px-6 py-2.5 rounded-full transition-colors"
                  >
                    Load More
                  </button>
                )}
                {visibleCount > 12 && (
                  <button
                    onClick={() => setVisibleCount(12)}
                    className="text-xs font-bold uppercase tracking-widest text-neutral-400 border border-white/10 hover:border-neutral-500 hover:text-white px-6 py-2.5 rounded-full transition-colors"
                  >
                    Show Less
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white/5 rounded-2xl border border-white/5">
            <Heart size={64} className="text-neutral-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
            <p className="text-neutral-400 max-w-md">
              Keep track of anime you want to watch by clicking the heart icon
              on any anime page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
