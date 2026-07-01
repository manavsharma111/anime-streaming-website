import { useState, useEffect } from "react"

// Unified hook to fetch Jikan data once to prevent rate limits
export function useJikanAnime() {
  const [data, setData] = useState({ topAiring: [], loading: true })

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        // Fetch top airing anime
        const res = await fetch(
          "https://api.jikan.moe/v4/top/anime?filter=airing&limit=15",
        )
        const json = await res.json()

        if (mounted && json.data) {
          setData({ topAiring: json.data, loading: false })
        }
      } catch (error) {
        console.error("Jikan API Error:", error)
        if (mounted) setData({ topAiring: [], loading: false })
      }
    }

    // Add a slight delay to avoid hitting limits if page remounts rapidly
    const timer = setTimeout(() => {
      fetchData()
    }, 300)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  return data
}
