const mongoose = require("mongoose");
const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Agent name is required"],
  },
});

module.exports = mongoose.model("Agent", AgentSchema);
