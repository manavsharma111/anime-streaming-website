const fs = require("fs")
const path = require("path")
const Episode = require("../models/Episode")

// VIDEO STREAMING
const streamEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findById(req.params.id)
    if (!episode) return res.status(404).json({ message: "Episode not found" })

    // Video file to local path
    const videoPath = path.resolve(__dirname, "..", episode.videoUrl)

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video file not found on server" })
    }

    const stat = fs.statSync(videoPath)
    const fileSize = stat.size
    const range = req.headers.range

    if (range) {
      // range request
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

      const chunksize = end - start + 1
      const file = fs.createReadStream(videoPath, { start, end })

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      }

      res.writeHead(206, head)
      file.pipe(res)
    } else {
      // if browser doesn't send range request, send the whole file
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      }
      res.writeHead(200, head)
      fs.createReadStream(videoPath).pipe(res)
    }
  } catch (error) {
    next(error)
  }
}

// VIDEO DOWNLOAD LOGIC
const downloadEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findById(req.params.id)
    if (!episode) return res.status(404).json({ message: "Episode not found" })

    const quality = req.query.quality || "720p" // 720p by default

    // Get the relative path for the requested quality from DB
    const downloadPathUrl =
      episode.downloadQualities && episode.downloadQualities[quality]

    if (!downloadPathUrl) {
      return res
        .status(404)
        .json({ message: `Quality ${quality} not available for this episode` })
    }
    // download path
    const basePath = path.join(__dirname, "..")
    const videoPath = path.join(basePath, downloadPathUrl)

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video file not found on server" })
    }

    res.download(videoPath, `${episode.title}-${quality}.mp4`, (err) => {
      if (err) {
        console.error("Download Error:", err)
      }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  streamEpisode,
  downloadEpisode,
}
