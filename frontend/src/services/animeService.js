import axiosInstance from "./api"

const animeService = {
  getAnimes: async (query) => {
    try {
      const response = await axiosInstance.get("/anime", { params: query })
      return response.data
    } catch (error) {
      console.error("Anime fetch error:", error)
      throw error
    }
  },
  getAnimeDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/anime/${id}`)
      return response.data
    } catch (error) {
      console.error("Anime details fetch error:", error)
      throw error
    }
  },
  getMalTrendingAnimes: async () => {
    try {
      const response = await axiosInstance.get("/anime/mal-trending")
      return response.data
    } catch (error) {
      console.error("MAL Trending fetch error:", error)
      throw error
    }
  },
  getSmartRecommendations: async () => {
    try {
      const response = await axiosInstance.get("/anime/smart-recommendations")
      return response.data
    } catch (error) {
      console.error("Smart Recommendations fetch error:", error)
      throw error
    }
  },
}

export default animeService
