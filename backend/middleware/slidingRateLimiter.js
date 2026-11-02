const redis = require("../config/redis")

const slidingWindowLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 5000,
  message = "Too many requests from this IP",
}) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress
      const key = `rate-limit:${ip}`
      const now = Date.now()
      const windowStart = now - windowMs

      // Atomic Redis transaction pipeline using sorted sets
      const pipeline = redis.pipeline()

      // 1. Evict timestamps falling outside the current sliding window
      pipeline.zremrangebyscore(key, 0, windowStart)

      // 2. Register current request timestamp with a unique member key
      pipeline.zadd(key, now, `${now}-${Math.random()}`)

      // 3. Count total active requests remaining in the rolling window
      pipeline.zcard(key)

      // 4. Refresh key TTL to ensure automatic cleanup of inactive IP entries
      pipeline.expire(key, Math.ceil(windowMs / 1000))

      const results = await pipeline.exec()

      // Validate pipeline output (zcard result is at index 2: [err, count])
      if (!results || !results[2] || results[2][0]) {
        throw (results && results[2] && results[2][0]) || new Error("Redis pipeline execution failed")
      }
      const requestCount = results[2][1]

      // Set standard RFC-compliant rate limit response headers
      res.setHeader("RateLimit-Limit", max)
      res.setHeader("RateLimit-Remaining", Math.max(0, max - requestCount))
      res.setHeader("RateLimit-Reset", Math.ceil((now + windowMs) / 1000))

      // Enforce rate limit threshold
      if (requestCount > max) {
        return res.status(429).json({
          success: false,
          message: message,
          retryAfterSeconds: Math.ceil(windowMs / 1000),
        })
      }

      next()
    } catch (error) {
      // Fail-open: log error and allow request through if Redis encounters issues
      console.error("Rate limiter error, passing through:", error.message)
      next()
    }
  }
}

module.exports = slidingWindowLimiter
