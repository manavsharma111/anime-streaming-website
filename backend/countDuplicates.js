require("dotenv").config();
const mongoose = require("mongoose");
const Anime = require("./models/Anime");

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const frieren = await Anime.find({ title: /Frieren/i });
  console.log("Frieren count:", frieren.length);
  frieren.forEach(a => console.log(a.title, a._id));
  process.exit(0);
}
check();
