const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  policyNumber: { type: String, required: true, unique: true },
  policyStartDate: { type: Date, required: true },
  policyEndDate: { type: Date, required: true },
  policyCategory: { type: mongoose.Schema.Types.ObjectId, ref: "LOB" },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Carrier" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Policy", policySchema);
