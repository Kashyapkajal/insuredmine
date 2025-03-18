const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  accountName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Account", accountSchema);
