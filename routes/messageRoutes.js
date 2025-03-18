const express = require("express");
const Message = require("../models/Message");
const cron = require("node-cron");

const router = express.Router();

// API to Schedule Messages
router.post("/schedule", async (req, res) => {
  const { message, day, time } = req.body;
  if (!message || !day || !time) {
    return res
      .status(400)
      .json({ message: "Message, day, and time are required" });
  }

  try {
    const scheduleDate = new Date(`${day} ${time}`);
    await Message.create({ message, scheduleDate });
    res.json({ message: "Message scheduled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling message", error });
  }
});

// Cron Job to Process Scheduled Messages
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const messages = await Message.find({ scheduleDate: { $lte: now } });

  messages.forEach(async (msg) => {
    console.log(`Executing scheduled message: ${msg.message}`);
    await Message.deleteOne({ _id: msg._id });
  });
});

module.exports = router;
