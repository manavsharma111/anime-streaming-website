const mongoose = require("mongoose")

const animeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    genres: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
    episodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Episode",
      },
    ],
    totalEpisodes: {
      type: Number,
      default: null,
    },
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

module.exports = mongoose.model("Anime", animeSchema)
