require("dotenv").config();
const mongoose = require("mongoose");
const Anime = require("./models/Anime");

async function removeDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const duplicates = await Anime.aggregate([
      {
        $group: {
          _id: { title: "$title" },
          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    let totalDeleted = 0;

    for (let dup of duplicates) {
      // Keep the first one, delete the rest
      const idsToDelete = dup.uniqueIds.slice(1);
      await Anime.deleteMany({ _id: { $in: idsToDelete } });
      totalDeleted += idsToDelete.length;
      console.log(`Deleted ${idsToDelete.length} duplicates for "${dup._id.title}"`);
    }

    console.log(`Finished removing duplicates. Total deleted: ${totalDeleted}`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

removeDuplicates();
