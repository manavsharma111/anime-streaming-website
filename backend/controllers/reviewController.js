const Review = require("../models/Review")
const Anime = require("../models/Anime")

// get anime reviews
exports.getAnimeReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ anime: req.params.animeId })
      .populate("user", "username avatar email")
      .populate("replies.user", "username avatar email")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: reviews,
    })
  } catch (err) {
    next(err)
  }
}

// add new review
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment, media } = req.body
    const animeId = req.params.animeId

    // Ensure user hasn't already reviewed
    const existingReview = await Review.findOne({
      anime: animeId,
      user: req.user.id,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this anime.",
      })
    }

    const review = await Review.create({
      anime: animeId,
      user: req.user.id,
      rating: Number(rating),
      comment,
      media: media || [],
    })

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "username avatar email",
    )

    // Calculate average rating
    const allReviews = await Review.find({ anime: animeId })
    const avgRating =
      allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length

    await Anime.findByIdAndUpdate(animeId, {
      rating: avgRating.toFixed(1),
    })

    // Emit Socket Event
    if (global.io) {
      global.io.emit("newReview", populatedReview)
    }

    res.status(201).json({
      success: true,
      data: populatedReview,
    })
  } catch (err) {
    next(err)
  }
}

// delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" })
    }

    if (review.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this review",
        })
    }

    const animeId = review.anime

    await review.deleteOne()

    // Calculate average rating
    const allReviews = await Review.find({ anime: animeId })
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) /
          allReviews.length
        : 0

    await Anime.findByIdAndUpdate(animeId, {
      rating: avgRating.toFixed(1),
    })

    if (global.io) {
      global.io.emit("deleteReview", req.params.id)
    }

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (err) {
    next(err)
  }
}

// add reply to review
exports.addReply = async (req, res, next) => {
  try {
    const { comment } = req.body
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" })
    }

    const reply = {
      user: req.user.id,
      comment,
      createdAt: Date.now(),
    }

    review.replies.push(reply)
    await review.save()

    const populatedReview = await Review.findById(review._id)
      .populate("user", "username avatar email")
      .populate("replies.user", "username avatar email")

    if (global.io) {
      global.io.emit("newReply", populatedReview)
    }

    res.status(201).json({
      success: true,
      data: populatedReview,
    })
  } catch (err) {
    next(err)
  }
}

// delete reply to review
exports.deleteReply = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" })
    }

    const reply = review.replies.id(req.params.replyId)

    if (!reply) {
      return res
        .status(404)
        .json({ success: false, message: "Reply not found" })
    }

    if (reply.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this reply",
        })
    }

    review.replies.pull(req.params.replyId)
    await review.save()

    const populatedReview = await Review.findById(review._id)
      .populate("user", "username avatar email")
      .populate("replies.user", "username avatar email")

    if (global.io) {
      global.io.emit("deleteReply", populatedReview)
    }

    res.status(200).json({
      success: true,
      data: populatedReview,
    })
  } catch (err) {
    next(err)
  }
}
