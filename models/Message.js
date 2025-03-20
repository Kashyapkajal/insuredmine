const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["pending", "sent"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
