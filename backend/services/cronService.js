const cron = require('node-cron');
const axios = require('axios');
const Anime = require('../models/Anime');

// Helper to map Jikan Anime to our DB Anime format
const mapJikanToAnime = (malAnime) => {
  return {
    title:
      malAnime.title_english || malAnime.title || malAnime.title_japanese,
    description: malAnime.synopsis || 'No description available.',
    year: malAnime.year || malAnime.aired?.prop?.from?.year || new Date().getFullYear(),
    rating: malAnime.score || 0,
    thumbnail: malAnime.images?.webp?.large_image_url || malAnime.images?.jpg?.large_image_url || '',
    cover: malAnime.trailer?.images?.maximum_image_url || malAnime.images?.webp?.large_image_url || '',
    trailerUrl: malAnime.trailer?.url || '',
    genres: malAnime.genres ? malAnime.genres.map((g) => g.name) : ['Unknown'],
    status: malAnime.status === 'Currently Airing' ? 'ongoing' : 'completed',
    totalEpisodes: malAnime.episodes || null,
  };
};

const syncLatestAnime = async () => {
  console.log('[Cron] Starting sync for latest airing anime...');
  try {
    const response = await axios.get('https://api.jikan.moe/v4/seasons/now?limit=20');
    const animes = response.data.data;

    let addedCount = 0;

    for (const malAnime of animes) {
      const mappedAnime = mapJikanToAnime(malAnime);
      
      // Check if anime already exists by title
      const existingAnime = await Anime.findOne({ title: mappedAnime.title });
      
      if (!existingAnime) {
        const newAnime = new Anime(mappedAnime);
        await newAnime.save();
        console.log(`[Cron] Synced new anime: ${mappedAnime.title}`);
        addedCount++;
      }
    }
    console.log(`[Cron] Sync complete. Added ${addedCount} new anime.`);
  } catch (error) {
    console.error('[Cron] Error syncing latest anime:', error.message);
  }
};

const initCronJobs = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', () => {
    syncLatestAnime();
  });
  console.log('[Cron] Anime Auto-Sync Job initialized (Runs daily at midnight).');
  
  // Run once immediately on startup
  console.log('[Cron] Running initial sync on startup...');
  syncLatestAnime();
};

module.exports = {
  initCronJobs,
  syncLatestAnime // Exporting so it can be called manually if needed
};
