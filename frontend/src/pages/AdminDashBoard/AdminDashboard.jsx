import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Menu } from 'lucide-react'
import { fetchAnimes } from '../../redux/slice/animeSlice'
import UploadEpisodeForm from '../../components/AdminDashBoard/UploadEpisode'
import AdminAnalytics from '../../components/AdminDashBoard/AdminAnalytics'
import AdminCatalog from '../../components/AdminDashBoard/AdminCatalog'
import CreateAnime from '../../components/AdminDashBoard/CreateAnime'
import AdminSidebar from '../../components/AdminDashBoard/AdminSidebar'
import AdminQueue from '../../components/AdminDashBoard/AdminQueue'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const { animeList: animes, loading } = useSelector((state) => state.anime)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAnimes({ limit: 100 }))
  }, [dispatch])

  const handleAnimeCreated = () => {
    setActiveTab('catalog')
    dispatch(fetchAnimes({ limit: 100 }))
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminAnalytics animes={animes} />
      case 'catalog':
        return <AdminCatalog />
      case 'create':
        return <CreateAnime onSuccess={handleAnimeCreated} />
      case 'upload':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <UploadEpisodeForm animesList={animes} />
          </motion.div>
        );
      case 'queue':
        return <AdminQueue />;
      default:
        return <AdminAnalytics animes={animes} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Mobile Header (Hamburger) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-neutral-950 border-b border-white/5 z-30 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-white hover:bg-white/10 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <span className="ml-3 font-black text-lg">Admin Panel</span>
      </div>

      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[260px] pt-[80px] min-h-screen pb-[100px] md:pb-0">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}