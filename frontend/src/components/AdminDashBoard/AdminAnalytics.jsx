import React, { useMemo, useState, useEffect } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from "recharts"
import {
  Tv,
  Clapperboard,
  Layers,
  Activity,
  Server,
  RefreshCcw,
  Cpu,
  Database,
  Eye,
  Calendar
} from "lucide-react"
import { motion } from "framer-motion"
import axiosInstance from "../../services/api"

const COLORS = ["#ef4444", "#f97316", "#3b82f6", "#10b981"]

export default function AdminAnalytics({ animes }) {
  const [recentEpisodes, setRecentEpisodes] = useState([])
  const [systemStats, setSystemStats] = useState(null)

  const fetchDashboardData = async () => {
    try {
      const epRes = await axiosInstance.get("/anime-admin/recent-episodes")
      if (epRes.data.success) {
        setRecentEpisodes(epRes.data.data)
      }
      
      const sysRes = await axiosInstance.get("/anime-admin/system-stats")
      if (sysRes.data.success) {
        setSystemStats(sysRes.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 15000)
    return () => clearInterval(interval)
  }, [])

  const stats = useMemo(() => {
    let totalEpisodes = 0
    let tvCount = 0
    let movieCount = 0
    let ovaCount = 0
    let genreCounts = {}

    animes.forEach((anime) => {
      const epCount = anime.episodes?.length || 0
      totalEpisodes += epCount

      if (anime.type === "Movie") movieCount++
      else if (anime.type === "OVA") ovaCount++
      else tvCount++

      if (anime.genres && Array.isArray(anime.genres)) {
        anime.genres.forEach((g) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1
        })
      }
    })

    const topViewedAnimes = [...animes]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(anime => ({
        name: anime.title.length > 15 ? anime.title.substring(0, 15) + "..." : anime.title,
        views: anime.views || 0
      }))

    return {
      totalEpisodes,
      tvCount,
      movieCount,
      topViewedAnimes,
      genreCount: Object.keys(genreCounts).length,
    }
  }, [animes])

  const uploadTimeline = useMemo(() => {
    const dates = {}
    recentEpisodes.forEach(ep => {
      const date = new Date(ep.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      dates[date] = (dates[date] || 0) + 1
    })
    return Object.keys(dates).map(date => ({ date, uploads: dates[date] })).reverse()
  }, [recentEpisodes])

  const MetricCard = ({ title, value, icon: Icon, colorClass, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          <h3 className="text-4xl font-black text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-4 rounded-2xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Anime"
          value={animes.length}
          icon={Tv}
          colorClass="bg-red-500/10 text-red-500"
          delay={0.1}
        />
        <MetricCard
          title="Total Movies"
          value={stats.movieCount}
          icon={Clapperboard}
          colorClass="bg-orange-500/10 text-orange-500"
          delay={0.2}
        />
        <MetricCard
          title="Total Episodes"
          value={stats.totalEpisodes}
          icon={Layers}
          colorClass="bg-blue-500/10 text-blue-500"
          delay={0.3}
        />
        <MetricCard
          title="Active Genres"
          value={stats.genreCount}
          icon={Activity}
          colorClass="bg-emerald-500/10 text-emerald-500"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Encoding Pipeline (Recent Episodes) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-1 bg-neutral-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col h-[500px]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-500" />
              Encoding Pipeline
            </h3>
            <button
              onClick={fetchDashboardData}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 bg-black/40 rounded-2xl p-4 overflow-y-auto custom-scrollbar border border-white/5">
            <div className="text-purple-400 text-xs font-mono mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              System metrics polling active
            </div>

            <div className="space-y-3">
              {recentEpisodes.length > 0 ? (
                recentEpisodes.map((ep) => {
                  let statusColor = "text-neutral-500 bg-neutral-800"
                  let dotColor = "bg-neutral-500"
                  if (ep.status === "queued") {
                    statusColor =
                      "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
                    dotColor = "bg-yellow-500"
                  }
                  if (ep.status === "processing") {
                    statusColor =
                      "text-blue-400 bg-blue-500/10 border-blue-500/20"
                    dotColor = "bg-blue-400 animate-pulse"
                  }
                  if (ep.status === "ready") {
                    statusColor =
                      "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    dotColor = "bg-emerald-500"
                  }
                  if (ep.status === "failed") {
                    statusColor = "text-red-500 bg-red-500/10 border-red-500/20"
                    dotColor = "bg-red-500"
                  }

                  return (
                    <div
                      key={ep._id}
                      className="flex justify-between items-center p-3 rounded-xl bg-neutral-900/50 border border-white/5 hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(ep.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-sm font-medium text-neutral-300 truncate pr-2">
                          {ep.anime?.title || "Unknown"} - Ep {ep.episodeNumber}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-2.5 py-1 rounded-md border ${statusColor}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                        ></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {ep.status}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-neutral-600 italic text-sm text-center py-8">
                  No recent episode activity.
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right side Advanced Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Top 5 Viewed Animes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col h-[280px]"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                Top Viewed Anime
              </h3>
              <div className="flex-1 w-full">
                {stats.topViewedAnimes.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topViewedAnimes}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="name" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: "#ffffff05" }}
                        contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "12px", color: "#fff" }}
                      />
                      <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500">No data available</div>
                )}
              </div>
            </motion.div>

            {/* Upload Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col h-[280px]"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Upload Timeline
              </h3>
              <div className="flex-1 w-full">
                {uploadTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={uploadTimeline}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "12px", color: "#fff" }}
                      />
                      <Area type="monotone" dataKey="uploads" stroke="#f97316" fillOpacity={1} fill="url(#colorUploads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500">No data available</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* System Benchmark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-neutral-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex-1"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              System Benchmark
            </h3>
            
            {systemStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
                {/* Memory Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-neutral-400 flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-500" /> RAM Usage
                    </p>
                    <p className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                      {Math.round(((systemStats.totalMem - systemStats.freeMem) / systemStats.totalMem) * 100)}%
                    </p>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 mb-2 border border-white/5 p-0.5 relative overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${((systemStats.totalMem - systemStats.freeMem) / systemStats.totalMem) * 100}%`}}></div>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-neutral-500">
                    <span>{((systemStats.totalMem - systemStats.freeMem) / 1024 / 1024 / 1024).toFixed(2)} GB Used</span>
                    <span>{(systemStats.totalMem / 1024 / 1024 / 1024).toFixed(2)} GB Total</span>
                  </div>
                </div>

                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-neutral-400 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-500" /> CPU Load
                    </p>
                    <p className="text-xs font-mono text-purple-500 bg-purple-500/10 px-2 py-1 rounded-md">
                      {systemStats.cpuCount} Cores
                    </p>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 mb-2 border border-white/5 p-0.5 relative overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, (systemStats.loadAvg[0] / systemStats.cpuCount) * 100)}%`}}></div>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-neutral-500">
                    <span>{systemStats.loadAvg[0].toFixed(2)} (1m avg)</span>
                    <span className="truncate max-w-[120px]" title={systemStats.cpuModel}>{systemStats.cpuModel}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 text-sm italic flex items-center justify-center h-full">Loading system metrics...</div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}
