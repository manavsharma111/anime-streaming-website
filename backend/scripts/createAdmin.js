require("dotenv").config()
const mongoose = require("mongoose")
const User = require("../models/User")
const connectDB = require("../config/db")

// Ensure required env vars are set
const adminEmail = process.env.ADMIN_EMAIL
const adminUsername = process.env.ADMIN_USERNAME || "admin"

if (!adminEmail) {
  console.error("Please set ADMIN_EMAIL in your .env file.")
  process.exit(1)
}

const createAdmin = async () => {
  try {
    await connectDB()
    const existing = await User.findOne({ email: adminEmail })
    if (existing) {
      console.log("Admin user already exists:", existing.email)
      return
    }
    const adminUser = new User({
      username: adminUsername,
      email: adminEmail,
      role: "admin",
    })
    await adminUser.save()
    console.log("Admin user created:", adminUser.email)
  } catch (err) {
    console.error("Error creating admin:", err)
  } finally {
    mongoose.disconnect()
  }
}

createAdmin()
