const express = require("express");
const router = express.Router();
const {
  getWatchHistory,
  addToHistory,
  deleteHistory,
  deleteAllHistory,
} = require("../controllers/historyController");
const { authMiddleware } = require("../middleware/authMiddleware");

// get watch history
router.get("/get-history", authMiddleware, getWatchHistory);
// add to watch history
router.post("/add-history", authMiddleware, addToHistory);
// delete history
router.delete("/delete-history/:id", authMiddleware, deleteHistory);
// delete all history
router.delete("/delete-all-history", authMiddleware, deleteAllHistory);

module.exports = router;
