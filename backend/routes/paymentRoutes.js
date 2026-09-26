const express = require("express")
const router = express.Router()
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
} = require("../controllers/paymentController")
// const authMiddleware = require("../middleware/auth") // Assuming you have an auth middleware

// Create order (user initiates payment)
router.post("/create-order", createRazorpayOrder) // add authMiddleware here if needed

// Verify payment signature
router.post("/verify-signature", verifyRazorpaySignature)

module.exports = router
