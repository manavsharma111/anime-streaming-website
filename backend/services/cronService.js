const cron = require('node-cron');
const axios = require('axios');
const Anime = require('../models/Anime');

// Helper to map Anilist Anime to our DB Anime format
const mapAnilistToAnime = (alAnime) => {
  return {
    title: alAnime.title?.english || alAnime.title?.romaji || "Unknown Title",
    description: (alAnime.description || 'No description available.').replace(/<br>/g, "\n"),
    year: alAnime.seasonYear || new Date().getFullYear(),
    rating: (alAnime.averageScore || 0) / 10,
    thumbnail: alAnime.coverImage?.extraLarge || alAnime.coverImage?.large || '',
    cover: alAnime.bannerImage || alAnime.coverImage?.extraLarge || '',
    trailerUrl: alAnime.trailer?.site === "youtube" ? `https://www.youtube.com/watch?v=${alAnime.trailer.id}` : '',
    genres: alAnime.genres || ['Unknown'],
    status: alAnime.status === 'RELEASING' ? 'ongoing' : 'completed',
    totalEpisodes: alAnime.episodes || null,
  };
};

const syncLatestAnime = async () => {
  console.log('[Cron] Starting sync for latest airing anime...');
  try {
    const query = `
      query {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, status: RELEASING, sort: SCORE_DESC) {
            idMal title { english romaji } description seasonYear averageScore 
            coverImage { extraLarge large } bannerImage trailer { id site } genres episodes status
          }
        }
      }
    `;
    const response = await axios.post('https://graphql.anilist.co', { query });
    const animes = response.data.data.Page.media;

    let addedCount = 0;

    for (const alAnime of animes) {
      const mappedAnime = mapAnilistToAnime(alAnime);
      
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
