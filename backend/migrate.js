const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs/promises");
const path = require("path");
const Episode = require("./models/Episode");
const { uploadDirectoryToR2 } = require("./services/r2UploadService");

dotenv.config();

const migrateData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB...");

    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (!publicUrl) {
      console.error("Missing CLOUDFLARE_R2_PUBLIC_URL");
      process.exit(1);
    }

    const rewriteUrl = (url) => url && url.startsWith('/uploads') ? `${publicUrl}${url}` : url;

    const episodes = await Episode.find({ hlsMasterUrl: { $regex: /^\/uploads/ } });
    console.log(`Found ${episodes.length} episodes to migrate to R2.`);

    for (const episode of episodes) {
      console.log(`Migrating episode ${episode.episodeNumber} (${episode._id})...`);
      
      const folderId = episode.hlsMasterUrl.split('/')[3]; // /uploads/processed/<folderId>/...
      const localDir = path.join(__dirname, 'uploads', 'processed', folderId);
      const s3Prefix = `uploads/processed/${folderId}`;

      try {
        await fs.access(localDir); // Check if exists
        console.log(`Found local directory: ${localDir}`);
        
        const uploadSuccess = await uploadDirectoryToR2(localDir, s3Prefix);

        if (uploadSuccess) {
          console.log(`Upload successful for episode ${episode._id}. Updating DB and deleting local files...`);
          
          episode.hlsMasterUrl = rewriteUrl(episode.hlsMasterUrl);
          
          if (episode.downloadQualities) {
            const downloads = Object.fromEntries(episode.downloadQualities);
            for (const key in downloads) {
              downloads[key] = rewriteUrl(downloads[key]);
            }
            episode.downloadQualities = downloads;
          }

          if (episode.subtitleTracks) {
            episode.subtitleTracks = episode.subtitleTracks.map(sub => ({
              ...sub.toObject(),
              url: rewriteUrl(sub.url)
            }));
          }

          await episode.save();
          
          await fs.rm(localDir, { recursive: true, force: true });
          console.log(`Finished migrating episode ${episode._id}.`);
        } else {
          console.error(`Upload failed for episode ${episode._id}. Skipping.`);
        }
      } catch (err) {
        console.error(`Local directory not found or error for ${localDir}:`, err.message);
        // Maybe it's already deleted or invalid, update DB anyway? 
        // No, skip if local files missing and not on R2
      }
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateData();
