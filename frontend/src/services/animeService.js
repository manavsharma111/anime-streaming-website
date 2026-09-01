import axiosInstance from "./api"

const animeService = {
  getAnimes: async (query) => {
    try {
      const response = await axiosInstance.get("/anime", { params: query })
      return response.data
    } catch (error) {
      console.error("Anime fetch error:", error)
      return error
    }
  },
  getAnimeDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/anime/${id}`)
      return response.data
    } catch (error) {
      console.error("Anime details fetch error:", error)
      return error
    }
  },
  getMalTrendingAnimes: async () => {
    try {
      const response = await axiosInstance.get("/anime/mal-trending")
      return response.data
    } catch (error) {
      console.error("MAL Trending fetch error:", error)
      return error
    }
  },
}

export default animeService
