const express = require("express")
const router = express.Router()
const {
  GoogleAuthLogin,
  googleCallback,
  logout,
  getCurrentUser,
  updateProfile,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  devLogin,
} = require("../controllers/authController")
const { authMiddleware } = require("../middleware/authMiddleware")

const adminUpload = require("../middleware/adminUpload")

router.get("/google", GoogleAuthLogin)
router.get("/google/callback", googleCallback)
router.post("/logout", logout)
router.post("/dev-login", devLogin)
router.get("/me", authMiddleware, getCurrentUser)
router.put(
  "/update-profile",
  authMiddleware,
  adminUpload.single("avatarFile"),
  updateProfile,
)

router.get("/notifications", authMiddleware, getNotifications)
router.put("/notifications/:id/read", authMiddleware, markNotificationRead)
router.delete("/notifications/:id", authMiddleware, deleteNotification)

module.exports = router
