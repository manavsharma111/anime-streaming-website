// handles multipart uploads for admin episode creation
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// ensure directories exist
const dirs = {
  video: path.join(__dirname, "..", "uploads", "raw_videos"),
  thumbnail: path.join(__dirname, "..", "uploads", "thumbnails"),
  cover: path.join(__dirname, "..", "uploads", "covers"),
  subtitles: path.join(__dirname, "..", "uploads", "subtitles"),
  audios: path.join(__dirname, "..", "uploads", "audios"),
}
Object.values(dirs).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = dirs[file.fieldname] || dirs.video
    cb(null, dest)
  },
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, `${unique}-${sanitized}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "video") {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowed = [".mp4", ".mkv", ".avi", ".webm"]
    if (file.mimetype.startsWith("video/") || allowed.includes(ext)) {
      return cb(null, true)
    }
    return cb(new Error("Invalid video format"), false)
  }
  // accept other file types
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 ** 3 },
}) // 5GB

module.exports = upload
