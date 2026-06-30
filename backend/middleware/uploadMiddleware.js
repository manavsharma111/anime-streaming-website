const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads", "raw_videos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Safe Sanitization: remove special char from file original name
    const sanitizedOriginalName = file.originalname.replace(
      /[^a-zA-Z0-9.]/g,
      "_",
    );
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "anime-" + uniqueSuffix + "-" + sanitizedOriginalName);
  },
});

const fileFilter = (req, file, cb) => {
  // MKV files standard stream containers some time mime typt is binary/octet-stream
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".mp4", ".mkv", ".avi", ".webm"];

  if (file.mimetype.startsWith("video/") || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid format! Please upload an anime video container (.mp4, .mkv, .avi, .webm)",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB Strict Bound
  },
});

module.exports = upload;
