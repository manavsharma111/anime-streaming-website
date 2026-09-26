const express = require("express")
const router = express.Router()
const {
  getAllPlans,
  Plans,
  getAllActiveSubscriptions,
  cancelSubscription,
} = require("../controllers/SubscriptionController")

// get all plans (For Users)
router.route("/plans").get(getAllPlans)

// seed/create 6 default plans (For Admin)
router.route("/create-plans").post(Plans)

// get all active user subscriptions (For Admin Dashboard)
router.route("/all-subscriptions").get(getAllActiveSubscriptions)

// cancel active subscription (For Users)
router.route("/cancel").post(cancelSubscription)

module.exports = router
