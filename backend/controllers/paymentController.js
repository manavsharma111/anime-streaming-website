const mongoose = require("mongoose")
const razorpayInstance = require("../config/payment")
const User = require("../models/User")
const Plan = require("../models/Plan")
const Subscription = require("../models/Subscription")
const crypto = require("crypto")
const { sendEmail } = require("../services/emailService")
const dotenv = require("dotenv")
dotenv.config()

/**
 * Creates a Razorpay Order with pro-rated billing calculation.
 * Computes remaining value on active subscriptions for plan upgrades/downgrades.
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { planId, userId } = req.body

    // Retrieve requested plan details to determine base price
    const newPlan = await Plan.findById(planId)
    if (!newPlan) {
      return res.status(404).json({ success: false, message: "Plan not found" })
    }

    let finalAmount = newPlan.price

    // Calculate pro-rated discount if the user currently holds an active subscription
    const activeSub = await Subscription.findOne({
      userId,
      status: "active",
    }).populate("planId")

    if (activeSub && activeSub.planId && activeSub.endDate > new Date()) {
      const oldPlan = activeSub.planId

      // Apply credit adjustment only if switching to a different tier
      if (oldPlan._id.toString() !== newPlan._id.toString()) {
        const timeDiff = activeSub.endDate.getTime() - new Date().getTime()
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

        // Determine unused monetary value of remaining duration
        const oldPricePerDay = oldPlan.price / oldPlan.duration
        const remainingValue = Math.floor(oldPricePerDay * daysRemaining)

        // Deduct unused value from target plan price (enforcing 1 INR minimum)
        finalAmount = Math.max(1, finalAmount - remainingValue)
      }
    }

    // Initialize payment order via Razorpay API (amount in paise)
    const order = await razorpayInstance.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    })

    res.json({ success: true, data: order, finalAmount })
  } catch (error) {
    console.error("Create Razorpay Order Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

/**
 * Verifies Razorpay payment signature and atomically provisions the subscription.
 * Implements full ACID guarantees via MongoDB session transactions:
 * all or nothing (plan update, subscription creation, and user entitlement).
 */
const verifyRazorpaySignature = async (req, res) => {
  // Initialize isolated database session for ACID transaction management
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId,
    } = req.body

    // Validate cryptographic signature from Razorpay
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ success: false, message: "Invalid Payment Signature" })
    }

    // 1. Fetch targeted plan within transaction boundary
    const plan = await Plan.findById(planId).session(session)
    if (!plan) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ success: false, message: "Plan not found" })
    }

    // 2. Query active subscriptions associated with user within session
    const activeSubs = await Subscription.find({ userId, status: "active" }).session(session)

    // Check if user is extending an existing active plan
    const samePlanSub = activeSubs.find(
      (sub) => sub.planId.toString() === planId.toString(),
    )

    if (samePlanSub) {
      // Extend end date of existing active subscription
      samePlanSub.endDate = new Date(
        samePlanSub.endDate.getTime() + plan.duration * 24 * 60 * 60 * 1000,
      )
      await samePlanSub.save({ session })

      // Invalidate redundant concurrent subscriptions if present
      await Subscription.updateMany(
        { userId, status: "active", _id: { $ne: samePlanSub._id } },
        { $set: { status: "cancelled" } },
        { session },
      )
    } else {
      // Plan tier change: Invalidate prior active subscriptions
      await Subscription.updateMany(
        { userId, status: "active" },
        { $set: { status: "cancelled" } },
        { session },
      )

      // Instantiate and persist new subscription record
      const newSubscription = new Subscription({
        userId,
        planId,
        startDate: Date.now(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
        status: "active",
      })
      await newSubscription.save({ session })
    }

    // 3. Atomically grant premium entitlements and append user notification
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isPremium: true,
        $push: {
          notifications: {
            message: `Welcome to ${plan.name}! Your subscription is active. 🚀`,
            link: "/profile",
            read: false,
            createdAt: new Date(),
          },
        },
      },
      { session, new: true },
    )

    // 4. Commit all multi-document operations atomically (ACID transaction)
    await session.commitTransaction()
    session.endSession()

    // 5. Asynchronously trigger confirmation email outside database transaction
    if (user && user.email) {
      const emailContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #f33767;">Welcome to ${plan.name}! 🚀</h2>
          <p>Hi ${user.username},</p>
          <p>Your subscription to the <strong>${plan.name}</strong> plan has been successfully activated.</p>
          <p><strong>Plan Price:</strong> ₹${plan.price}</p>
          <p>You can now enjoy premium features on Anime Stream.</p>
          <br/>
          <p>Best Regards,</p>
          <p>Anime Stream Team</p>
        </div>
      `
      sendEmail(
        user.email,
        "Subscription Activated - Anime Stream",
        emailContent,
      ).catch((err) => console.error("Email notification dispatch error:", err))
    }

    return res.json({
      success: true,
      message: "Payment Verified and Subscription Activated!",
    })
  } catch (error) {
    // Abort transaction and rollback all mutations on unexpected failure
    await session.abortTransaction()
    session.endSession()
    console.error("Verify Razorpay Signature Transaction Error:", error)
    return res.status(500).json({ message: "Server Error during subscription activation" })
  }
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
}
