const Wishlist = require("../models/Wishlist")
const Anime = require("../models/Anime")

// Get user's wishlist
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate("anime", "title thumbnail status type episodes rating")
      .sort({ addedAt: -1 })

    res.status(200).json({
      success: true,
      data: wishlist,
    })
  } catch (error) {
    next(error)
  }
}

// Add anime to wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const { anime, status } = req.body

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ user: req.user.id, anime })

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Anime is already in your wishlist",
      })
    }

    const wishlistItem = new Wishlist({
      user: req.user.id,
      anime,
      status: status || "Planning",
    })

    await wishlistItem.save()

    res.status(201).json({
      success: true,
      data: wishlistItem,
      message: "Added to wishlist successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Remove from wishlist
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlistItem = await Wishlist.findByIdAndDelete(req.params.id)

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Removed from wishlist successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Update wishlist status
const updateWishlistStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    
    const validStatuses = ["Watching", "Completed", "Planning", "Paused", "Dropped"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" })
    }

    const wishlistItem = await Wishlist.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    ).populate("anime", "title thumbnail status type episodes rating")

    if (!wishlistItem) {
      return res.status(404).json({ success: false, message: "Wishlist item not found" })
    }

    res.status(200).json({
      success: true,
      data: wishlistItem,
      message: "Status updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistStatus,
}
