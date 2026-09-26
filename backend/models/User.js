const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Anime",
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Anime",
      },
    ],
    history: [
      {
        anime: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Anime",
        },
        episode: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Episode",
        },
        watchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },

    notifications: [
      {
        message: String,
        link: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("User", userSchema)
