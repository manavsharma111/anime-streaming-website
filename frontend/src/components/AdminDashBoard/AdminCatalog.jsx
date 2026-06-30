import React, { useState, useEffect } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  ListVideo,
  Image as ImageIcon,
  Sparkles,
  Edit,
  Trash2,
  Film,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axiosInstance from "../../services/api"
import AdminEpisodes from "./AdminEpisodes"
import EditAnime from "./EditAnime"
import { getImageUrl } from "../../utils/image"

export default function AdminCatalog() {
  const [animes, setAnimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  const fetchCatalog = async (page = 1, searchQuery = "") => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(`/anime`, {
        params: {
          page,
          limit: pagination.limit,
          search: searchQuery,
          sort: "latest",
        },
      })
      if (res.data.success) {
        setAnimes(res.data.data)
        setPagination(res.data.pagination)
      }
    } catch (err) {
      console.error("Failed to fetch catalog", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCatalog(1, search)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(pagination.total / pagination.limit)
    ) {
      fetchCatalog(newPage, search)
    }
  }

  const handleDeleteAnime = async (id) => {
    try {
      await axiosInstance.delete(`/anime-admin/${id}`)
      fetchCatalog(pagination.page, search)
    } catch (err) {
      console.error("Failed to delete anime", err)
      alert("Error deleting anime")
    }
  }

  const [selectedAnime, setSelectedAnime] = useState(null)
  const [editingAnime, setEditingAnime] = useState(null)

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1

  if (selectedAnime) {
    return (
      <AdminEpisodes
        anime={selectedAnime}
        onBack={() => {
          setSelectedAnime(null)
          fetchCatalog(pagination.page, search)
        }}
      />
    )
  }

  if (editingAnime) {
    return (
      <EditAnime
        anime={editingAnime}
        onBack={() => setEditingAnime(null)}
        onSuccess={() => {
          setEditingAnime(null)
          fetchCatalog(pagination.page, search)
        }}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Sparkles className="w-6 h-6" />
            </div>
            Catalog Management
          </h3>
          <p className="text-sm text-neutral-400 mt-2 tracking-wide">
            Showing page {pagination.page} of {totalPages} ({pagination.total}{" "}
            total entries)
          </p>
        </div>
        <div className="relative w-full sm:w-auto min-w-[300px]">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search catalog by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
        <div className="w-full">
          {/* Table Header (Hidden on Mobile) */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-neutral-900/50 border-b border-white/5 p-5">
            <div className="col-span-1 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Cover
            </div>
            <div className="col-span-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Title & Metadata
            </div>
            <div className="col-span-2 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">
              Status
            </div>
            <div className="col-span-2 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">
              Episodes
            </div>
            <div className="col-span-1 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">
              Views
            </div>
            <div className="col-span-2 text-xs font-bold text-neutral-500 uppercase tracking-wider text-center">
              Actions
            </div>
          </div>

          <div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 text-center text-neutral-500"
                >
                  <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                  Loading catalog data...
                </motion.div>
              ) : animes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 text-center text-neutral-500"
                >
                  No animes found matching your search.
                </motion.div>
              ) : (
                <motion.div
                  key="catalog-list"
                  className="divide-y divide-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {animes.map((anime, index) => (
                    <motion.div
                      key={anime._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer p-4 md:p-5 flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
                    >
                      {/* Cover */}
                      <div className="md:col-span-1 flex-shrink-0">
                        {anime.thumbnail ? (
                          <div className="relative overflow-hidden rounded-lg shadow-lg w-full max-w-[120px] md:w-14 aspect-[2/3] mx-auto md:mx-0 bg-neutral-950">
                            <img
                              src={getImageUrl(anime.thumbnail)}
                              alt="cover"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="w-full max-w-[120px] md:w-14 aspect-[2/3] mx-auto md:mx-0 bg-neutral-900 rounded-lg flex items-center justify-center text-neutral-700">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="md:col-span-4 text-center md:text-left w-full">
                        <p className="font-black text-white text-lg md:text-base mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {anime.title}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          <span className="bg-neutral-800/50 px-2 py-1 rounded-md text-neutral-300">
                            {anime.year}
                          </span>
                          <span>
                            {(anime.genres || []).slice(0, 3).join(" • ")}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2 flex justify-center md:block w-full">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 md:px-2.5 md:py-1 rounded-md text-xs md:text-[10px] font-black uppercase tracking-widest ${anime.status === "completed" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}
                        >
                          {anime.status}
                        </span>
                      </div>

                      {/* Episodes & Views on Mobile */}
                      <div className="md:hidden flex justify-center gap-8 w-full border-y border-white/5 py-3 my-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase">
                            Episodes
                          </span>
                          <div className="flex items-center gap-1 text-white font-black">
                            <ListVideo className="w-4 h-4 text-neutral-500" />{" "}
                            {anime.episodes?.length || 0}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase">
                            Views
                          </span>
                          <div className="flex items-center gap-1 text-white font-black">
                            <Eye className="w-4 h-4 text-neutral-500" />{" "}
                            {(anime.views || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Episodes on Desktop */}
                      <div className="hidden md:flex md:col-span-2 justify-end w-full">
                        <div className="flex items-center gap-2 text-white font-black text-lg">
                          <ListVideo className="w-4 h-4 text-neutral-500" />
                          {anime.episodes?.length || 0}
                        </div>
                      </div>

                      {/* Views on Desktop */}
                      <div className="hidden md:flex md:col-span-1 justify-end w-full">
                        <div className="flex items-center gap-2 text-white font-black text-lg">
                          <Eye className="w-4 h-4 text-neutral-500" />
                          {(anime.views || 0).toLocaleString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-2 flex justify-center w-full mt-2 md:mt-0">
                        <div className="flex items-center gap-4 md:gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedAnime(anime)
                            }}
                            title="Manage Episodes"
                            className="p-3 md:p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl md:rounded-lg transition-colors flex items-center justify-center flex-1 md:flex-none"
                          >
                            <Film size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingAnime(anime)
                            }}
                            title="Edit Anime"
                            className="p-3 md:p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl md:rounded-lg transition-colors flex items-center justify-center flex-1 md:flex-none"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAnime(anime._id)
                            }}
                            title="Delete Anime"
                            className="p-3 md:p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl md:rounded-lg transition-colors flex items-center justify-center flex-1 md:flex-none"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-3 bg-neutral-900 border border-white/5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-6 py-3 bg-black/40 border border-white/5 rounded-xl text-sm font-black text-white shadow-inner tracking-widest">
            {pagination.page} / {totalPages}
          </div>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="p-3 bg-neutral-900 border border-white/5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
