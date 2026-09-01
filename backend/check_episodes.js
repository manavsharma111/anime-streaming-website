const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const EpisodeSchema = new mongoose.Schema({
  animeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Anime' },
  episodeNumber: Number,
  title: String,
  status: String,
  hlsMasterUrl: String,
});

const Episode = mongoose.models.Episode || mongoose.model("Episode", EpisodeSchema);
const Anime = mongoose.models.Anime || mongoose.model("Anime", new mongoose.Schema({ title: String }));

async function check() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/animestream");
  const episodes = await Episode.find({}).populate('animeId');
  console.log("Episodes:");
  for (let ep of episodes) {
    console.log(`- Ep ${ep.episodeNumber}: ${ep.title} | Status: ${ep.status} | URL: ${ep.hlsMasterUrl}`);
  }
  process.exit(0);
}

check();
