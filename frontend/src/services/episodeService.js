import axiosInstance from "./api"

const episodeService = {
  // Admin: Upload episode with video, thumbnail, subtitles, audios
  uploadEpisodeMeta: async (formData) => {
    try {
      const response = await axiosInstance.post(`/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          console.log(`Upload Progress: ${percent}%`)
        },
      })
      return response.data
    } catch (error) {
      console.error("Episode meta upload error:", error)
      return error
    }
  },
  // Admin: Create anime
  createAnime: async (data) => {
    const response = await axiosInstance.post("/anime-admin/create", data)
    return response.data
  },
  // Admin: Update anime
  updateAnime: async (id, data) => {
    const response = await axiosInstance.put(`/anime-admin/${id}`, data)
    return response.data
  },
  // Admin: Delete anime
  deleteAnime: async (id) => {
    const response = await axiosInstance.delete(`/anime-admin/${id}`)
    return response.data
  },
}

export default episodeService
