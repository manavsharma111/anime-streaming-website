const mongoose = require("mongoose");
const Anime = require("./models/Anime");
require("dotenv").config();

async function fixThumbnails() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully.");

    const animes = await Anime.find({});
    console.log(`Found ${animes.length} animes in the database.`);

    for (let anime of animes) {
      console.log(`\nFetching data for: ${anime.title}`);
      try {
        // Jikan API has rate limiting, so we wait 1.5 seconds between requests
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.title)}&limit=1`);
        const json = await response.json();
        const data = json.data;

        if (data && data.length > 0) {
          const malData = data[0];
          const highResImage = malData.images.webp.large_image_url || malData.images.jpg.large_image_url;
          const score = malData.score || anime.rating;
          const totalEpisodes = malData.episodes || null;

          console.log(`  -> Found Match: ${malData.title}`);
          console.log(`  -> New Image: ${highResImage}`);
          console.log(`  -> New Score: ${score}`);
          console.log(`  -> Total Episodes: ${totalEpisodes}`);

          anime.thumbnail = highResImage;
          anime.cover = highResImage;
          anime.rating = score;
          if (totalEpisodes) {
            anime.totalEpisodes = totalEpisodes;
          }
          
          await anime.save();
          console.log(`  [+] Successfully updated ${anime.title}`);
        } else {
          console.log(`  [-] No exact match found on Jikan API for ${anime.title}. Skipping.`);
        }
      } catch (err) {
        console.error(`  [!] Error fetching data for ${anime.title}:`, err.message);
      }
    }

    console.log("\nAll animes processed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Critical Error:", error);
    process.exit(1);
  }
}

fixThumbnails();
