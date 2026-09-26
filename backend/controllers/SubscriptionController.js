const Plan = require("../models/Plan")
const Subscription = require("../models/Subscription")
const User = require("../models/User")
const { sendEmail } = require("../services/emailService")

// Fetch all active plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 })
    res.json({ success: true, data: plans })
  } catch (error) {
    console.error("Get Plans Error:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

// Admin only: Generate the default 6 plans automatically
const Plans = async (req, res) => {
  try {
    const defaultPlans = [
      // Monthly Plans (30 days)
      {
        name: "Super Saiyan (Monthly)",
        price: 99,
        duration: 30,
        maxResolution: 480,
        isAllowedDownloads: false,
        description: "Good quality video (480p). Watch on any device.",
        isPremium: true,
      },
      {
        name: "Super Saiyan Rose (Monthly)",
        price: 199,
        duration: 30,
        maxResolution: 720,
        isAllowedDownloads: true,
        description: "Better quality video (720p). Downloads allowed.",
        isPremium: true,
      },
      {
        name: "Mastered Ultra Instinct (Monthly)",
        price: 299,
        duration: 30,
        maxResolution: 1080,
        isAllowedDownloads: true,
        description: "Best quality video (1080p). Downloads allowed.",
        isPremium: true,
      },

      // Yearly Plans (365 days)
      {
        name: "Super Saiyan (Yearly)",
        price: 999,
        duration: 365,
        maxResolution: 480,
        isAllowedDownloads: false,
        description: "Good quality video (480p) for a year.",
        isPremium: true,
      },
      {
        name: "Super Saiyan Rose (Yearly)",
        price: 1999,
        duration: 365,
        maxResolution: 720,
        isAllowedDownloads: true,
        description: "Better quality video (720p) for a year.",
        isPremium: true,
      },
      {
        name: "Mastered Ultra Instinct (Yearly)",
        price: 2999,
        duration: 365,
        maxResolution: 1080,
        isAllowedDownloads: true,
        description: "Best quality video (1080p) for a year.",
        isPremium: true,
      },
    ]

    // Check if plans already exist to avoid duplicates
    const existingCount = await Plan.countDocuments()
    if (existingCount > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Plans already exist in DB." })
    }

    await Plan.insertMany(defaultPlans)
    res.json({
      success: true,
      message: "6 Default plans successfully created!",
    })
  } catch (error) {
    console.error("Seed Plans Error:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

// Admin only: Get all users and their active plans
const getAllActiveSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("userId", "username email avatar") // User ki detail laayega
      .populate("planId", "name price duration maxResolution") // Plan ki detail laayega
      .sort({ createdAt: -1 })

    res.json({ success: true, data: subscriptions })
  } catch (error) {
    console.error("Get All Subscriptions Error:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

// Cancel active subscription
const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "UserId required" })

    // Find the active subscription and populate the plan to get the price
    const activeSub = await Subscription.findOne({
      userId,
      status: "active",
    }).populate("planId")
    let refundAmountText = ""

    if (activeSub && activeSub.planId && activeSub.endDate > new Date()) {
      // Calculate remaining days
      const timeDiff = activeSub.endDate.getTime() - new Date().getTime()
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

      // Pro-rated refund
      const pricePerDay = activeSub.planId.price / activeSub.planId.duration
      const refundAmount = Math.floor(pricePerDay * daysRemaining)

      refundAmountText = `<p><strong>Refund Amount:</strong> ₹${refundAmount}</p>`
    } else if (activeSub && activeSub.planId) {
      refundAmountText = `<p><strong>Refund Amount:</strong> ₹0 (Subscription already expired)</p>`
    }

    await Subscription.updateMany(
      { userId, status: "active" },
      { $set: { status: "cancelled" } },
    )

    const user = await User.findByIdAndUpdate(userId, {
      isPremium: false,
      $push: {
        notifications: {
          message: "Your subscription has been cancelled and refund initiated.",
          link: "/profile",
          read: false,
          createdAt: new Date(),
        },
      },
    })

    if (user && user.email) {
      const emailContent = `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #f33767;">Subscription Cancelled</h2>
                    <p>Hi ${user.username},</p>
                    <p>Your Anime Stream premium subscription has been successfully cancelled and any applicable refunds have been initiated.</p>
                    ${refundAmountText}
                    <p><em>Note: Refunds typically take 5-7 business days to reflect in your original payment method.</em></p>
                    <p>You can resubscribe anytime to get premium access back.</p>
                    <br/>
                    <p>Best Regards,</p>
                    <p>Anime Stream Team</p>
                </div>
            `
      sendEmail(
        user.email,
        "Subscription Cancelled - Anime Stream",
        emailContent,
      ).catch((err) => console.error("Email error:", err))
    }

    res.json({
      success: true,
      message: "Subscription cancelled successfully. Refund processed.",
    })
  } catch (error) {
    console.error("Cancel Subscription Error:", error)
    res.status(500).json({ success: false, message: "Server Error" })
  }
}

module.exports = {
  getAllPlans,
  Plans,
  getAllActiveSubscriptions,
  cancelSubscription,
}
