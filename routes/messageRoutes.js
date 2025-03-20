const express = require("express");
const Message = require("../models/Message");
const cron = require("node-cron");
const router = express.Router();

// API to Schedule Messages (Stored in MongoDB)
router.post("/schedule", async (req, res) => {
  const { message, day, time } = req.body;

  if (!message || !day || !time) {
    return res
      .status(400)
      .json({ message: "Message, day, and time are required" });
  }

  const validDays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  if (!validDays.includes(day.toLowerCase())) {
    return res.status(400).json({
      message: "Invalid day. Use full weekday names (e.g., 'tuesday').",
    });
  }

  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return res
      .status(400)
      .json({ message: "Invalid time format. Use HH:mm (24-hour format)." });
  }
  const now = new Date();
  const nowUTC = new Date(now.toISOString());
  console.log(nowUTC);
  try {
    const newMessage = await Message.create({
      message,
      day: day.toLowerCase(),
      time,
      status: "pending",
    });
    res.json({ message: "Message scheduled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling message", error });
  }
});

// Cron Job: Runs every minute to check if it's time to insert the message
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentDay = now
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:mm format
  try {
    // Find messages that match the current day & time AND are still "pending"
    const messages = await Message.find({
      day: currentDay,
      time: currentTime,
      status: "pending",
    });
    messages.forEach(async (msg) => {
      console.log(`✅ Inserting Message into DB: "${msg.message}"`);

      // Update the message status to "sent" so it's not processed again
      await Message.updateOne({ _id: msg._id }, { status: "sent" });
    });
  } catch (error) {
    console.error("Error processing scheduled messages:", error);
  }
});

module.exports = router;
