const History = require("../models/History")
const User = require("../models/User")

// Get user's watch history
const getWatchHistory = async (req, res, next) => {
  try {
    const history = await History.find({ user: req.user.id })
      .populate("anime", "title thumbnail")
      .populate("episode", "title episodeNumber")
      .sort({ updatedAt: -1 })

    res.status(200).json({
      success: true,
      data: history,
    })
  } catch (error) {
    next(error)
  }
}

// Add to watch history
const addToHistory = async (req, res, next) => {
  try {
    const { anime, episode, watchTime, totalDuration, progress, completed } =
      req.body

    // continue watching function
    const existingHistory = await History.findOne({ user: req.user.id, anime })

    if (existingHistory) {
      existingHistory.episode = episode
      if (watchTime !== undefined) existingHistory.watchTime = watchTime
      if (totalDuration !== undefined)
        existingHistory.totalDuration = totalDuration
      if (progress !== undefined) existingHistory.progress = progress
      if (completed !== undefined) existingHistory.completed = completed
      // update date
      existingHistory.updatedAt = Date.now()
      await existingHistory.save()
      return res.status(200).json({ success: true, data: existingHistory })
    }

    const history = new History({
      user: req.user.id,
      anime,
      episode,
      watchTime: watchTime || 0,
      totalDuration: totalDuration || 0,
      progress: progress || 0,
      completed: completed || false,
    })

    await history.save()

    res.status(201).json({
      success: true,
      data: history,
    })
  } catch (error) {
    next(error)
  }
}

// delete history
const deleteHistory = async (req, res, next) => {
  try {
    const history = await History.findByIdAndDelete(req.params.id)
    res.status(200).json({
      success: true,
      data: history,
    })
  } catch (error) {
    next(error)
  }
}

// delete all history

const deleteAllHistory = async (req, res, next) => {
  try {
    const history = await History.deleteMany({ user: req.user.id })
    res.status(200).json({
      success: true,
      data: history,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getWatchHistory,
  addToHistory,
  deleteHistory,
  deleteAllHistory,
}
