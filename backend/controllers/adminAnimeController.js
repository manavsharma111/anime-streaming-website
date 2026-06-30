const Anime = require("../models/Anime");
const Episode = require("../models/Episode");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
ffmpeg.setFfmpegPath(ffmpegStatic);
const redisClient = require("../config/redis");

// create
const createAnime = async (req, res, next) => {
  const keys = await redisClient.keys('animes:*');
  if (keys.length > 0) await redisClient.del(keys);
  try {
    const anime = new Anime(req.body);
    await anime.save();
    res.status(201).json({ success: true, data: anime });
  } catch (err) {
    next(err);
  }
};
// update
const updateAnime = async (req, res, next) => {
  const keys = await redisClient.keys('animes:*');
if (keys.length > 0) await redisClient.del(keys);
  try {
    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        req.body.thumbnail = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.cover && req.files.cover[0]) {
        req.body.cover = `/uploads/covers/${req.files.cover[0].filename}`;
      }
    }
    const anime = await Anime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: anime });
  } catch (err) {
    next(err);
  }
};
// delete
const deleteAnime = async (req, res, next) => {
  const keys = await redisClient.keys('animes:*');
if (keys.length > 0) await redisClient.del(keys);
  try {
    await Anime.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Anime deleted" });
  } catch (err) {
    next(err);
  }
};

// upload episode meta (admin)
const uploadEpisodeMeta = async (req, res, next) => {
  const keys = await redisClient.keys('animes:*');
if (keys.length > 0) await redisClient.del(keys);
  try {
    const { anime, episodeNumber, title, scheduledAt } = req.body;

    if (!req.files || !req.files.video || !req.files.video[0]) {
      return res.status(400).json({ message: "Video file required" });
    }
    const videoFile = req.files.video[0];

    // thumbnail – admin may upload, otherwise auto‑generate
    let thumbnailUrl = "";
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
    } else {
      const thumbPath = path.join(
        "uploads",
        "thumbnails",
        `${videoFile.filename}.png`,
      );
      await new Promise((resolve, reject) => {
        ffmpeg(videoFile.path)
          .screenshots({
            timestamps: ["00:00:02"],
            filename: path.basename(thumbPath),
            folder: path.dirname(thumbPath),
            size: "320x180",
          })
          .on("end", resolve)
          .on("error", reject);
      });
      thumbnailUrl = `/uploads/thumbnails/${path.basename(thumbPath)}`;
    }

    const subtitleTracks = (req.files.subtitles || []).map((f) => ({
      lang: f.originalname.split(".").shift().toLowerCase(),
      url: `/uploads/subtitles/${f.filename}`,
    }));

    const audioTracks = (req.files.audios || []).map((f) => ({
      lang: f.originalname.split(".").shift().toLowerCase(),
      url: `/uploads/audios/${f.filename}`,
    }));

    const newEpisode = new Episode({
      anime,
      episodeNumber,
      title,
      videoUrl: `/uploads/raw_videos/${videoFile.filename}`,
      thumbnailUrl,
      subtitleTracks,
      audioTracks,
      status: scheduledAt ? "scheduled" : "queued",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });
    await newEpisode.save();

    // Push the newly created episode to the Anime's episodes array
    await Anime.findByIdAndUpdate(anime, {
      $push: { episodes: newEpisode._id }
    });
    const rawVideoPath = videoFile.path;
    const audioPaths = (req.files.audios || []).map((f) => f.path);
    const subtitlePaths = (req.files.subtitles || []).map((f) => f.path);
    
    const outputDir = path.join(
      __dirname,
      "..",
      "uploads",
      "processed",
      newEpisode._id.toString(),
    );
    
    const { videoQueue } = require("../controllers/uploadController")
    await videoQueue.add(
      "processVideo",
      { 
        episodeId: newEpisode._id, 
        inputPath: rawVideoPath, 
        audioPaths, 
        subtitlePaths, 
        outputDir 
      },
      { delay: scheduledAt ? Math.max(0, new Date(scheduledAt) - Date.now()) : 0 }
    )

    if (global.io) {
      global.io.emit("newEpisode", {
        animeId: anime,
        episodeId: newEpisode._id,
        title,
        thumbnailUrl,
        subtitleTracks,
        audioTracks,
      });
    }

    res.status(202).json({ success: true, data: newEpisode });
  } catch (err) {
    next(err);
  }
};

// Get recent episodes for system logs
const getRecentEpisodes = async (req, res, next) => {
  try {
    const episodes = await Episode.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("anime", "title");
    res.status(200).json({ success: true, data: episodes });
  } catch (err) {
    next(err);
  }
};

// Episode CRUD
const getEpisodesByAnime = async (req, res, next) => {
  try {
    const episodes = await Episode.find({ anime: req.params.animeId }).sort({ episodeNumber: 1 });
    res.status(200).json({ success: true, data: episodes });
  } catch (err) {
    next(err);
  }
};

const updateEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    // Clear related redis keys
    const keys = await redisClient.keys('animes:*');
    if (keys.length > 0) await redisClient.del(keys);
    res.status(200).json({ success: true, data: episode });
  } catch (err) {
    next(err);
  }
};

const deleteEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findById(req.params.id);
    if (!episode) return res.status(404).json({ success: false, message: "Episode not found" });

    // Remove from Anime array
    await Anime.findByIdAndUpdate(episode.anime, { $pull: { episodes: episode._id } });
    
    // Delete physical files (processed and raw)
    const outputDir = path.join(__dirname, "..", "uploads", "processed", episode._id.toString());
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    if (episode.videoUrl && fs.existsSync(path.join(__dirname, "..", episode.videoUrl))) {
      fs.unlinkSync(path.join(__dirname, "..", episode.videoUrl));
    }

    await Episode.findByIdAndDelete(req.params.id);

    // Clear related redis keys
    const keys = await redisClient.keys('animes:*');
    if (keys.length > 0) await redisClient.del(keys);

    res.status(200).json({ success: true, message: "Episode deleted completely" });
  } catch (err) {
    next(err);
  }
};

const getQueueStatus = async (req, res, next) => {
  try {
    const { videoQueue } = require("../controllers/uploadController");
    const active = await videoQueue.getJobs(['active']);
    const waiting = await videoQueue.getJobs(['waiting', 'delayed']);
    const failed = await videoQueue.getJobs(['failed']);

    const formatJob = (j, status) => ({
      id: j.id,
      progress: j.progress,
      data: j.data,
      status,
      failedReason: j.failedReason
    });

    res.status(200).json({
      success: true,
      data: {
        active: active.map(j => formatJob(j, 'active')),
        waiting: waiting.map(j => formatJob(j, 'waiting')),
        failed: failed.map(j => formatJob(j, 'failed'))
      }
    });
  } catch (err) {
    next(err);
  }
};

const retryJob = async (req, res, next) => {
  try {
    const { videoQueue } = require("../controllers/uploadController");
    const job = await videoQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    
    await job.retry();
    res.status(200).json({ success: true, message: "Job retried successfully" });
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { videoQueue } = require("../controllers/uploadController");
    const job = await videoQueue.getJob(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    
    await job.remove();
    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  createAnime, updateAnime, deleteAnime, 
  uploadEpisodeMeta, getRecentEpisodes, 
  getEpisodesByAnime, updateEpisode, deleteEpisode,
  getQueueStatus, retryJob, deleteJob
};
