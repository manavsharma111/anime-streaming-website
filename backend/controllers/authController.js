const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
dotenv.config()

// Generate Access Token (15 mins)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  })
}

// Generate Refresh Token (7 days)
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  )
}

// Login via Google Auth
const GoogleAuthLogin = (req, res) => {
  const googleUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.GOOGLE_CALLBACK}` +
    `&response_type=code` +
    `&scope=openid email profile` +
    `&access_type=offline` +
    `&prompt=select_account`

  res.redirect(googleUrl)
}

// Google Callback handler
const googleCallback = async (req, res) => {
  try {
    const code = req.query.code
    if (!code) {
      return res
        .status(400)
        .json({ message: "Google callback error: No code provided" })
    }

    // Exchange code for tokens
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK,
        grant_type: "authorization_code",
      }),
    })
    const data = await response.json()
    const { access_token } = data

    // Get user info from Google
    const userInfo = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )
    const userInfoData = await userInfo.json()
    const { id, email, name, picture } = userInfoData

    // Check if user exists in database
    let user = await User.findOne({ email })
    if (!user) {
      //  Auto-Admin Logic
      let newRole = "user"
      const adminEmail = process.env.ADMIN_EMAIL
      if (email === adminEmail) {
        newRole = "admin"
      }

      user = new User({
        username: name,
        email,
        avatar: picture,
        role: newRole,
        wishlist: [],
        favorites: [],
        history: [],
      })
      await user.save()
    }

    // Generate application tokens
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Determine if connection is secure based on environment
    const isProduction = process.env.NODE_ENV === "production"

    // Set access token cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    })

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
    if (user.role === "admin") {
      res.redirect(`${frontendUrl}/admin`)
    } else {
      res.redirect(`${frontendUrl}/`)
    }
  } catch (error) {
    console.log("Google Auth Error:", error)
    res.status(500).json({ message: "Google callback error" })
  }
}

// logout
const logout = (req, res) => {
  res.clearCookie("token")
  res.clearCookie("refreshToken")
  res.json({ message: "Logout successful", success: true })
}
// Get Current User Profile
const getCurrentUser = async (req, res) => {
  try {
    // req.user is populated by the authMiddleware
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ success: true, data: user })
  } catch (error) {
    console.error("Get Current User Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (username) user.username = username
    if (avatar) user.avatar = avatar

    await user.save()

    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select("-password")
    res.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error("Update Profile Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get Notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notifications")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    // Sort notifications by newest first
    const sortedNotifications = user.notifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )
    res.json({ success: true, data: sortedNotifications })
  } catch (error) {
    console.error("Get Notifications Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Mark Notification as Read
const markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const notification = user.notifications.id(req.params.id)
    if (notification) {
      notification.read = true
      await user.save()
    }
    res.json({ success: true })
  } catch (error) {
    console.error("Mark Notification Read Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    user.notifications.pull(req.params.id)
    await user.save()

    res.json({ success: true })
  } catch (error) {
    console.error("Delete Notification Error:", error)
    res.status(500).json({ message: "Server Error" })
  }
}

module.exports = {
  GoogleAuthLogin,
  googleCallback,
  generateAccessToken,
  generateRefreshToken,
  logout,
  getCurrentUser,
  updateProfile,
  getNotifications,
  markNotificationRead,
  deleteNotification,
}
