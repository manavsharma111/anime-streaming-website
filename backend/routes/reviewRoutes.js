const express = require("express")
const router = express.Router()
const {
  getAnimeReviews,
  addReview,
  deleteReview,
  addReply,
  deleteReply,
} = require("../controllers/reviewController")
const { authMiddleware } = require("../middleware/authMiddleware")

router.route("/:animeId").get(getAnimeReviews).post(authMiddleware, addReview)

router.route("/:id").delete(authMiddleware, deleteReview)

router.route("/:id/reply").post(authMiddleware, addReply)

router.route("/:id/reply/:replyId").delete(authMiddleware, deleteReply)

module.exports = router
