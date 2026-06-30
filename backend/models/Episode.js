const mongoose = require("mongoose")

const episodeSchema = new mongoose.Schema(
  {
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anime",
      required: true,
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    // Streaming Tracks
    hlsMasterUrl: {
      type: String,
      default: "",
    },
    // Custom Dynamic Timestamps (Seconds me)
    introStart: {
      type: Number,
      default: 0,
    },
    introEnd: {
      type: Number,
      default: 0,
    },
    outroStart: {
      type: Number,
      default: 0,
    },
    outroEnd: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    downloadQualities: {
      type: Object,
      default: {
        1080: "1080p",
        720: "720p",
        480: "480p",
        360: "360",
      },
    },
    videoUrl: {
      type: String,
      default: "",
    },
    subTitle: {
      type: Object,
      default: {
        eng: "English",
      },
    },
    status: {
      type: String,
      enum: ["queued", "processing", "ready", "failed"],
      default: "queued",
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
    isScheduledProcessed: {
      type: Boolean,
      default: false,
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    subtitleTracks: [
      {
        lang: { type: String },
        url: { type: String },
      },
    ],
    audioTracks: [
      {
        lang: { type: String },
        url: { type: String },
      },
    ],
    processedFiles: [
      {
        path: { type: String }, // e.g. /uploads/processed/1715529600_1080p.mp4
        resolution: { type: String }, // e.g. '1080p', '720p'
        size: { type: Number }, // bytes
        bitrate: { type: Number }, // kbps
        duration: { type: Number }, // seconds
        codec: { type: String }, // e.g. 'h264'
        audioCodec: { type: String },
        audioBitrate: { type: Number },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    viewers: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Episode", episodeSchema)
