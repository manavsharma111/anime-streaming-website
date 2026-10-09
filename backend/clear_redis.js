const { Queue } = require("bullmq")
const Redis = require("ioredis")

require("dotenv").config()
const connection = new Redis(
  process.env.REDIS_URI || "redis://127.0.0.1:6379",
)

async function fixQueue() {
  const queue = new Queue("videoProcessing", { connection })

  try {
    console.log("Obliterating the queue to fix missing meta errors...")
    await queue.obliterate({ force: true })
    console.log("Queue perfectly restored to default state!")
  } catch (err) {
    console.error("Error obliterating:", err.message)
  } finally {
    await queue.close()
    connection.quit()
  }
}

fixQueue()
