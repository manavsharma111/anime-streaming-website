const cron = require("node-cron")
const Subscription = require("../models/Subscription")
const { sendEmail } = require("../services/emailService")

// Start the cron job
const initSubscriptionCron = () => {
  // This cron runs every day at 00:00 (Midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] Checking for expiring subscriptions...")
    try {
      // Find today + 3 days
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 3)

      // Set start of target date and end of target date to find exactly 3 days away
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      // Find all active subscriptions ending in exactly 3 days
      const expiringSubs = await Subscription.find({
        status: "active",
        endDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
        .populate("userId")
        .populate("planId")

      if (expiringSubs.length === 0) {
        console.log("[Cron] No subscriptions expiring in 3 days.")
        return
      }

      console.log(
        `[Cron] Found ${expiringSubs.length} subscriptions expiring. Sending emails...`,
      )

      // Loop through and send emails
      for (const sub of expiringSubs) {
        const user = sub.userId
        const plan = sub.planId

        if (!user || !user.email) continue

        const subject = "⚠️ Your Anime Stream Subscription is Expiring Soon!"
        const htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Hi ${user.username},</h2>
                        <p>Your <strong>${plan.name}</strong> subscription is expiring in exactly <strong>3 days</strong> (on ${new Date(sub.endDate).toDateString()}).</p>
                        <p>To continue enjoying ad-free anime and downloads, please renew your subscription soon!</p>
                        <br>
                        <a href="${process.env.FRONTEND_URL}/pricing" style="background-color: #ff4500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Now</a>
                        <br><br>
                        <p>Thank you,</p>
                        <p>Anime Stream Team</p>
                    </div>
                `

        await sendEmail(user.email, subject, htmlContent)
      }

      console.log("[Cron] Expiration reminder emails sent successfully.")
    } catch (error) {
      console.error("[Cron] Error checking expiring subscriptions:", error)
    }
  })

  console.log("[Cron] Subscription Expiration Reminder Job initialized.")
}

module.exports = initSubscriptionCron
