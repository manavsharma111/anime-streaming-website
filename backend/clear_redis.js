const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis('redis://default:kRb96xFvLTnQZ8MBWUjd1gSIXG5xXpqA@spoon-bat-tin-21436.db.redis.io:15895');

async function fixQueue() {
  const queue = new Queue('videoProcessing', { connection });
  
  try {
    console.log("Obliterating the queue to fix missing meta errors...");
    await queue.obliterate({ force: true });
    console.log("Queue perfectly restored to default state!");
  } catch (err) {
    console.error("Error obliterating:", err.message);
  } finally {
    await queue.close();
    connection.quit();
  }
}

fixQueue();
