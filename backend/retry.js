require('dotenv').config();
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
const Episode = require('./models/Episode');
const connectDB = require('./config/db');

async function retryFailedEpisodes() {
  await connectDB();
  const Redis = require('ioredis');
  const queue = new Queue('videoProcessing', {
    connection: new Redis(process.env.REDIS_URI, { maxRetriesPerRequest: null })
  });

  const failedEpisodes = await Episode.find({ status: 'failed' });
  console.log(`Found ${failedEpisodes.length} failed episodes.`);

  for (const ep of failedEpisodes) {
    ep.status = 'queued';
    await ep.save();
    
    // Deduce the raw file path from videoUrl 
    // Usually videoUrl looks like /uploads/raw_videos/something.mkv
    const inputPath = `C:/NEWTUBE/backend${ep.videoUrl}`;
    const outputDir = `C:/NEWTUBE/backend/uploads/processed/${ep._id}`;

    await queue.add('processVideo', {
      episodeId: ep._id,
      inputPath: inputPath,
      audioPaths: [],
      subtitlePaths: [],
      outputDir: outputDir
    });
    console.log(`Re-queued episode ${ep._id}`);
  }

  process.exit(0);
}

retryFailedEpisodes().catch(console.error);
