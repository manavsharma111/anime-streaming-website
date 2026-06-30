const { authMiddleware } = require("./authMiddleware")

const adminCheck = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Admin only" })
  }
}

const admin = (req, res, next) => {
  authMiddleware(req, res, (err) => {
    if (err) return next(err)
    adminCheck(req, res, next)
  })
}

module.exports = admin
