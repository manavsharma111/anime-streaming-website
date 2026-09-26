const mongoose = require("mongoose")

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  isAllowedDownloads: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: true,
  },
  maxResolution: {
    type: Number,
    enum: [480, 720, 1080],
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

module.exports = mongoose.model("Plan", planSchema)
