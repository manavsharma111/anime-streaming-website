const mongoose = require("mongoose");
const Anime = require("./models/Anime");
require("dotenv").config();

async function seedMal() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully.");

    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      console.log(`\nFetching Page ${page}...`);
      try {
        // Fetch top anime paginated
        const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}`);
        const json = await response.json();
        
        if (response.status === 429 || !json.data) {
          console.log("Rate limited or no data. Waiting 5 seconds before retrying...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue; // retry same page
        }

        if (json.data.length === 0) {
          console.log("Empty data array. Finishing.");
          break;
        }

        let breakOuter = false;

        for (let malData of json.data) {
          // Break completely if score is below 6
          if (malData.score !== null && malData.score < 6.0) {
             console.log("Reached anime with score < 6.0. Stopping.");
             breakOuter = true;
             break;
          }

          const highResImage = malData.images.webp?.large_image_url || malData.images.jpg?.large_image_url || "";
          
          if (!highResImage) continue; // skip if no image

          const updateData = {
            title: malData.title_english || malData.title,
            description: malData.synopsis || "No description available.",
            year: malData.year || (malData.aired && malData.aired.prop && malData.aired.prop.from ? malData.aired.prop.from.year : 2024) || 2024,
            rating: malData.score || 0,
            thumbnail: highResImage,
            cover: highResImage,
            genres: malData.genres && malData.genres.length > 0 ? malData.genres.map(g => g.name) : ["Action"],
            status: malData.status === "Currently Airing" ? "ongoing" : "completed",
            totalEpisodes: malData.episodes || null,
          };

          // Upsert into DB
          await Anime.findOneAndUpdate(
            { title: updateData.title }, // Find by title
            { $set: updateData }, // Update data
            { upsert: true, new: true } // Create if not exists
          );
          
          console.log(`  [+] Upserted: ${updateData.title}`);
        }

        if (breakOuter) {
           break;
        }

        hasNextPage = json.pagination.has_next_page;
        page++;
        
        // Wait to avoid rate limit (Jikan allows max 3 req/sec, we do 1 req / 1.5 sec)
        await new Promise((resolve) => setTimeout(resolve, 1500));

      } catch (err) {
        console.error(`Error fetching page ${page}:`, err.message);
        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.log("\nFinished seeding MAL database!");
    process.exit(0);
  } catch (error) {
    console.error("Critical Error:", error);
    process.exit(1);
  }
}

seedMal();
