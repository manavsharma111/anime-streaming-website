import React, { useState, useEffect } from "react"
import { Search, ChevronDown, Filter } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import axiosInstance from "../../services/api"
import CustomSelect from "../common/CustomSelect"

export default function QuickFilter() {
  const navigate = useNavigate()
  const location = useLocation()

  const [filters, setFilters] = useState({
    genres: "",
    year: "",
    status: "",
    sort: "",
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setFilters({
      genres: params.get("genres") || "",
      year: params.get("year") || "",
      status: params.get("status") || "",
      sort: params.get("sort") || "",
    })
  }, [location.search])

  const [availableGenres, setAvailableGenres] = useState([
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Romance",
    "Sci-Fi",
  ])

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axiosInstance.get("/anime/genres")
        if (res.data.success && res.data.data.length > 0) {
          setAvailableGenres(res.data.data.sort())
        }
      } catch (err) {
        console.error("Failed to fetch genres:", err)
      }
    }
    fetchGenres()
  }, [])

  const filterOptions = [
    { key: "genres", label: "Genre", options: availableGenres },
    {
      key: "year",
      label: "Year",
      options: ["2024", "2023", "2022", "2021", "2020"],
    },
    { key: "status", label: "Status", options: ["Ongoing", "Completed"] },
    {
      key: "sort",
      label: "Order",
      options: [
        { name: "Rating", val: "rating" },
        { name: "Latest", val: "latest" },
        { name: "Oldest", val: "oldest" },
      ],
    },
  ]

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search)

    // Update filter params or remove them if empty
    if (filters.genres) params.set("genres", filters.genres)
    else params.delete("genres")
    if (filters.year) params.set("year", filters.year)
    else params.delete("year")
    if (filters.status) params.set("status", filters.status)
    else params.delete("status")
    if (filters.sort) params.set("sort", filters.sort)
    else params.delete("sort")

    params.set("page", "1") // reset to page 1 on filter change

    navigate(`/search?${params.toString()}`)
  }

  const handleClear = () => {
    const params = new URLSearchParams(window.location.search)
    const hasActiveFilters = filters.genres || filters.year || filters.status || filters.sort
    const hasUrlFilters = params.has("genres") || params.has("year") || params.has("status") || params.has("sort")

    if (!hasActiveFilters && !hasUrlFilters) {
      return // Nothing to clear!
    }

    setFilters({ genres: "", year: "", status: "", sort: "" })
    
    // Preserve the search query when clearing filters
    const newParams = new URLSearchParams()
    if (params.has("q")) newParams.set("q", params.get("q"))
    
    navigate(`/search${newParams.toString() ? '?' + newParams.toString() : ''}`)
  }

  return (
    <div className="bg-[#110e16] p-5 sm:p-6 rounded-2xl border border-white/5 shadow-xl w-full relative">
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f33767]/5 rounded-full blur-3xl"></div>
      </div>

      <h3 className="text-white font-black text-lg mb-5 sm:mb-6 flex items-center gap-2 uppercase tracking-widest">
        <Filter className="text-[#f33767]" size={20} />
        Advanced Search
      </h3>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        {filterOptions.map((filterGroup) => (
          <div key={filterGroup.key} className="relative group">
            <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-1.5 pl-1">
              {filterGroup.label}
            </label>
            <CustomSelect
              options={[
                { label: "Any", value: "" },
                ...filterGroup.options.map((opt) => {
                  const isObj = typeof opt === "object"
                  return {
                    label: isObj ? opt.name : opt,
                    value: isObj ? opt.val : opt,
                  }
                }),
              ]}
              value={filters[filterGroup.key]}
              onChange={(val) => handleChange(filterGroup.key, val)}
              placeholder={filterGroup.label}
              className="w-full bg-[#1a1721] hover:bg-[#201d2a] border border-white/5 group-hover:border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider py-3 pl-3 pr-3 rounded-xl transition-colors outline-none cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-row gap-3">
        <button
          onClick={handleClear}
          className="flex-1 sm:flex-none sm:w-1/3 bg-[#1a1721] hover:bg-[#201d2a] border border-white/10 hover:border-white/20 text-neutral-300 font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center transition-all text-xs"
        >
          Clear
        </button>
        <button
          onClick={handleSearch}
          className="flex-[2] sm:flex-none sm:w-2/3 bg-[#f33767] hover:bg-transparent border border-[#f33767] text-white font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(243,55,103,0.3)] text-xs group hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search
            size={16}
            className="hidden sm:block group-hover:translate-x-1 transition-transform"
          />
          Search
        </button>
      </div>
    </div>
  )
}
