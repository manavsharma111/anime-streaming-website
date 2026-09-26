const mongoose = require("mongoose")

const animeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    rating: {
      // This is MAL rating
      type: Number,
      required: true,
      index: true,
    },
    platformRating: {
      // This is User platform rating
      type: Number,
      default: 0,
    },
    isPremiumOnly: {
      type: Boolean,
      default: false,
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
      index: true,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
      index: true,
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
      index: true,
    },
    viewers: {
      type: [String],
      default: [],
      select: false, // Don't fetch the heavy viewers array by default
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Anime", animeSchema)
