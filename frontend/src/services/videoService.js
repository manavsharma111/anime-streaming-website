const VIDEO_BASE = import.meta.env.VITE_BASE_URL || "http://localhost:8080"

const videoService = {
  // DIRECT MASTER HLS URL (Player hit directly to stream)
  getHlsStreamUrl: (episodeId) => {
    return `${VIDEO_BASE}/uploads/processed/${episodeId}/streaming/master.m3u8`
  },

  // DOWNLOAD LINKS (Quality selector backend triggers routes mapping)
  // quality parameter options: "1080p" | "720p" | "480p"
  getDownloadUrl: (episodeId, quality = "720p") => {
    return `${VIDEO_BASE}/api/videos/download/${episodeId}?quality=${quality}`
  },

  //  THUMBNAILS CONTAINER PATHS
  getThumbnailFolderUrl: (episodeId) => {
    return `${VIDEO_BASE}/uploads/processed/${episodeId}/thumbnails/`
  },

  // SUBTITLES STATIC LINKS BINDING
  getSubtitleUrl: (trackUrl) => {
    return `${VIDEO_BASE}${trackUrl}`
  },
}

export default videoService
