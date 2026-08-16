const jwt = require("jsonwebtoken")
const User = require("../models/User")

const authMiddleware = async (req, res, next) => {
  try {
    // Get access token from cookies or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]

    // Function to handle refresh token logic
    const handleRefreshToken = async () => {
      const refreshToken = req.cookies?.refreshToken
      if (!refreshToken) {
        return res
          .status(401)
          .json({ message: "Session expired. Please login again." })
      }

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        )
        const user = await User.findById(decodedRefresh.id)

        if (!user) {
          return res.status(401).json({ message: "Unauthorized: User not found" })
        }

        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        })

        res.cookie("token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        req.user = user
        return next()
      } catch (refreshError) {
        return res
          .status(401)
          .json({ message: "Session expired. Please login again." })
      }
    }

    if (!token) {
      // If no access token is provided, try to use the refresh token instead of immediately failing
      return await handleRefreshToken()
    }

    try {
      // Verify access token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decodedToken.id)

      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" })
      }

      req.user = user
      return next()
    } catch (jwtError) {
      // If access token is expired, check for refresh token
      if (jwtError.name === "TokenExpiredError") {
        return await handleRefreshToken()
      }

      // For any other JWT errors (like invalid signature)
      return res.status(401).json({ message: "Unauthorized: Invalid token" })
    }
  } catch (error) {
    console.log("Auth middleware error:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

module.exports = { authMiddleware }
