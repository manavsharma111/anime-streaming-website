const razorpayInstance = require("../config/payment")
const User = require("../models/User")
const Plan = require("../models/Plan")
const Subscription = require("../models/Subscription")
const crypto = require("crypto")
const { sendEmail } = require("../services/emailService")
const dotenv = require("dotenv")
dotenv.config()

// create razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const { planId, userId } = req.body

    // Fetch the new plan to get its base price
    const newPlan = await Plan.findById(planId)
    if (!newPlan) {
      return res.status(404).json({ success: false, message: "Plan not found" })
    }

    let finalAmount = newPlan.price

    // Pro-rated calculation: Find existing active subscription
    const activeSub = await Subscription.findOne({
      userId,
      status: "active",
    }).populate("planId")

    if (activeSub && activeSub.planId && activeSub.endDate > new Date()) {
      const oldPlan = activeSub.planId

      // If it's a different plan (upgrade/downgrade), calculate prorated discount
      if (oldPlan._id.toString() !== newPlan._id.toString()) {
        // Calculate remaining days
        const timeDiff = activeSub.endDate.getTime() - new Date().getTime()
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

        // Calculate value of remaining days on old plan
        const oldPricePerDay = oldPlan.price / oldPlan.duration
        const remainingValue = Math.floor(oldPricePerDay * daysRemaining)

        // Discount final amount
        finalAmount = Math.max(1, finalAmount - remainingValue) // Minimum 1 INR
      }
      // If it's the same plan, no discount is applied. They will just pay full amount to extend their time.
    }

    const order = await razorpayInstance.orders.create({
      amount: finalAmount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    })
    res.json({ success: true, data: order, finalAmount })
  } catch (error) {
    console.error("Create Razorpay Order Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// verify razorpay signature
const verifyRazorpaySignature = async (req, res) => {
  try {
    // Frontend must pass userId and planId along with razorpay details
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      planId,
    } = req.body
    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    if (expectedSignature === razorpay_signature) {
      // Payment is successful! Now activate the plan

      // Fetch the Plan to know its duration
      const plan = await Plan.findById(planId)
      if (!plan) {
        return res
          .status(404)
          .json({ success: false, message: "Plan not found" })
      }

      // Check if user already has active subscriptions
      const activeSubs = await Subscription.find({ userId, status: "active" })

      // Check if one of the active subs is the same plan
      let samePlanSub = activeSubs.find(
        (sub) => sub.planId.toString() === planId.toString(),
      )

      if (samePlanSub) {
        // Extending same plan
        samePlanSub.endDate = new Date(
          samePlanSub.endDate.getTime() + plan.duration * 24 * 60 * 60 * 1000,
        )
        await samePlanSub.save()

        // Cancel all other active subs just in case of duplicates
        await Subscription.updateMany(
          { userId, status: "active", _id: { $ne: samePlanSub._id } },
          { $set: { status: "cancelled" } },
        )
      } else {
        // Changing plan (Upgrade/Downgrade)
        // Cancel ALL existing active subscriptions
        await Subscription.updateMany(
          { userId, status: "active" },
          { $set: { status: "cancelled" } },
        )

        // Create New Subscription in DB
        const newSubscription = new Subscription({
          userId,
          planId,
          startDate: Date.now(),
          endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
          status: "active",
        })
        await newSubscription.save()
      }

      // Update User's isPremium status and add a notification
      const user = await User.findByIdAndUpdate(userId, {
        isPremium: true,
        $push: {
          notifications: {
            message: `Welcome to ${plan.name}! Your subscription is active. 🚀`,
            link: "/profile",
            read: false,
            createdAt: new Date(),
          },
        },
      })

      // Send confirmation email asynchronously
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
        ).catch((err) => console.error("Email error:", err))
      }

      res.json({
        success: true,
        message: "Payment Verified and Subscription Activated!",
      })
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid Payment Signature" })
    }
  } catch (error) {
    console.error("Verify Razorpay Signature Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
}
