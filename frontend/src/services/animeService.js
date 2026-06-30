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
}

export default animeService
