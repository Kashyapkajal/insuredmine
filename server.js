const express = require("express");
const connectDB = require("./config/db");
const Agent = require("./models/Agent");
const User = require("./models/User");
const Account = require("./models/Account");
const LOB = require("./models/LOB");
const Carrier = require("./models/Carrier");
const Policy = require("./models/Policy");
const Message = require("./models/Message");
const uploadRoutes = require("./routes/uploadRoutes");
const policyRoutes = require("./routes/policyRoutes");
const monitorRoutes = require("./routes/monitorRoutes");
const messageRoutes = require("./routes/messageRoutes");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

//Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/monitor", monitorRoutes);
app.use("/api/message", messageRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
