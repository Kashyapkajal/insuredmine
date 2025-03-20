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
    // Construct schedule date in UTC format
    const scheduleDate = new Date(`${day}T${time}:00.000Z`);
    console.log("scheduleDate", scheduleDate);
    if (scheduleDate.toString() === "Invalid Date") {
      return res.status(400).json({
        message:
          "Invalid date format. Use 'day' as YYYY-MM-DD and 'time' as HH:mm (24-hour format).",
      });
    }
    // Check if the scheduled date and time is in the past
    const now = new Date();
    const nowUTC = new Date(now.toISOString());
    console.log(nowUTC);
    if (scheduleDate < nowUTC) {
      return res.status(400).json({
        message: "Cannot schedule a message in the past.",
      });
    }
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
