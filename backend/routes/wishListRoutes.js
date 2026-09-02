const express = require("express")
const router = express.Router()
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistStatus,
} = require("../controllers/wishlistController")
const { authMiddleware } = require("../middleware/authMiddleware")

// get wishlist
router.get("/get-wishlist", authMiddleware, getWishlist)
// add to wishlist
router.post("/add-wishlist", authMiddleware, addToWishlist)
// update wishlist status
router.put("/update-status/:id", authMiddleware, updateWishlistStatus)
// remove from wishlist
router.delete("/remove-from-wishlist/:id", authMiddleware, removeFromWishlist)

module.exports = router
