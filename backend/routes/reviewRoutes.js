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

// get reviews and add review
router.route("/:animeId").get(getAnimeReviews).post(authMiddleware, addReview)
// delete review
router.route("/:id").delete(authMiddleware, deleteReview)
// add reply to review
router.route("/:id/reply").post(authMiddleware, addReply)
// delete reply from review
router.route("/:id/reply/:replyId").delete(authMiddleware, deleteReply)

module.exports = router
