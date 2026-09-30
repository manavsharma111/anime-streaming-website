import React, { useState, useEffect } from "react"
import axiosInstance from "../../services/api"
import { Users, Crown, Calendar, IndianRupee } from "lucide-react"
import CustomSelect from "../common/CustomSelect"
import { getImageUrl } from "../../utils/image"

export default function AdminUsers() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axiosInstance.get(
          "/subscriptions/all-subscriptions",
        )
        if (response.data.success) {
          setSubscriptions(response.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptions()
  }, [])

  const calculateDaysLeft = (endDate) => {
    const diffTime = new Date(endDate) - new Date()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const activeSubs = subscriptions.filter((sub) => sub.status === "active")
  const totalRevenue = activeSubs.reduce(
    (acc, sub) => acc + (sub.planId?.price || 0),
    0,
  )

  if (loading) {
    return (
      <div className="p-8 text-neutral-400">
        Loading users & subscriptions...
      </div>
    )
  }

  const filteredSubs = subscriptions.filter((sub) => {
    if (filterStatus === "all") return true
    return sub.status === filterStatus
  })

  const sortedSubs = [...filteredSubs].sort((a, b) => {
    if (sortBy === "newest")
      return (
        new Date(b.createdAt || b.startDate || 0) -
        new Date(a.createdAt || a.startDate || 0)
      )
    if (sortBy === "oldest")
      return (
        new Date(a.createdAt || a.startDate || 0) -
        new Date(b.createdAt || b.startDate || 0)
      )

    const daysA = a.status === "active" ? calculateDaysLeft(a.endDate) : -1
    const daysB = b.status === "active" ? calculateDaysLeft(b.endDate) : -1

    if (sortBy === "daysLeftAsc") return daysA - daysB
    if (sortBy === "daysLeftDesc") return daysB - daysA
    return 0
  })

  return (
    <div className="p-4 md:p-8 pb-32 w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white mb-2">
          Users & Subscriptions
        </h1>
        <p className="text-neutral-400">
          Manage platform users and track active subscriptions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm text-neutral-400 font-medium mb-1">
              Total Users with Subs
            </p>
            <h3 className="text-3xl font-bold text-white">
              {subscriptions.length}
            </h3>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm text-neutral-400 font-medium mb-1">
              Active Subscriptions
            </p>
            <h3 className="text-3xl font-bold text-[#f33767]">
              {activeSubs.length}
            </h3>
          </div>
          <Crown className="absolute -right-4 -bottom-4 w-24 h-24 text-[#f33767]/5 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm text-neutral-400 font-medium mb-1">
              Active Revenue
            </p>
            <h3 className="text-3xl font-bold text-green-500">
              ₹{totalRevenue}
            </h3>
          </div>
          <IndianRupee className="absolute -right-4 -bottom-4 w-24 h-24 text-green-500/5 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <CustomSelect
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          placeholder="Filter by Status"
          containerClassName="w-full sm:w-48"
          className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f33767] transition-colors"
        />

        <CustomSelect
          value={sortBy}
          onChange={(val) => setSortBy(val)}
          options={[
            { value: "newest", label: "Newest First" },
            { value: "oldest", label: "Oldest First" },
            { value: "daysLeftAsc", label: "Days Left (Low to High)" },
            { value: "daysLeftDesc", label: "Days Left (High to Low)" },
          ]}
          placeholder="Sort By"
          containerClassName="w-full sm:w-64"
          className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f33767] transition-colors"
        />
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900/30 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 bg-neutral-900/50">
                <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  User
                </th>
                <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  Plan Details
                </th>
                <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                  Time Left
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedSubs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-neutral-500">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                sortedSubs.map((sub) => (
                  <tr
                    key={sub._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(
                            sub.userId?.avatar ||
                            "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                              sub.userId?._id
                          )}
                          alt="avatar"
                          className="w-10 h-10 rounded-full bg-neutral-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">
                            {sub.userId?.username || "Unknown User"}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {sub.userId?.email || "No Email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 min-w-[150px] whitespace-nowrap">
                      <div>
                        <p className="text-[#a855f7] font-semibold">
                          {sub.planId?.name || "Unknown Plan"}
                        </p>
                        <p className="text-xs text-neutral-400">
                          ₹{sub.planId?.price || 0}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${sub.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-neutral-500" />
                        <span className="text-sm text-neutral-300">
                          {sub.status === "active"
                            ? `${calculateDaysLeft(sub.endDate)} days`
                            : "-"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
