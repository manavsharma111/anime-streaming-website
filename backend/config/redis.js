const IORedis = require("ioredis");
const dotenv = require("dotenv").config();



redisConnection = new IORedis(
  process.env.REDIS_URI || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  },
);
const redisClient = new IORedis(process.env.REDIS_URI || "redis://127.0.0.1:6379" )

redisClient.on("connect", () => {
  console.log("redis connection for bullMQ connected");
});

redisClient.on("error", () => {
  console.log("redis connection error for bullMQ");
});

redisConnection.on("connect", () => {
  console.log("redis connected successfully");
});

redisConnection.on("error", () => {
  console.log("redis connection error");
});

module.exports = redisConnection;
