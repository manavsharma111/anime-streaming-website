require("dotenv").config();
const mongoose = require("mongoose");
const Anime = require("./models/Anime");

async function count() {
  await mongoose.connect(process.env.MONGODB_URI);
  const total = await Anime.countDocuments();
  console.log(`Total animes in DB: ${total}`);
  process.exit(0);
}
count();
