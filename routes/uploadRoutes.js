const express = require("express");
const multer = require("multer");
const path = require("path");
const { Worker } = require("worker_threads");

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// API to Upload Data Using Worker Threads
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const worker = new Worker(
    path.join(__dirname, "../workers/uploadWorker.js"),
    {
      workerData: { filePath: req.file.path },
    }
  );

  worker.on("message", (message) => {
    res.json({ message: "File processed successfully", details: message });
  });

  worker.on("error", (error) => {
    res.status(500).json({ message: "Error processing file", error });
  });
});

module.exports = router;
