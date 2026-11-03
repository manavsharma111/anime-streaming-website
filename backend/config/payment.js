const Razorpay = require("razorpay")
const dotenv = require("dotenv")
const path = require("path")

dotenv.config({ path: path.resolve(__dirname, "../.env") })

// Initialize Razorpay conditionally to prevent crashes if keys are not provided
let razorpayInstance = null

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
} else {
  console.warn("[Razorpay] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment integration disabled.")
}

module.exports = razorpayInstance
