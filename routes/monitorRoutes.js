const express = require("express");
const os = require("os");
const { exec } = require("child_process");

const router = express.Router();

// Function to Check CPU Usage
const checkCPUUsage = () => {
  const cpus = os.cpus();
  let totalLoad = 0;

  cpus.forEach((cpu) => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const idle = cpu.times.idle;
    totalLoad += (1 - idle / total) * 100;
  });

  return totalLoad / cpus.length;
};

// API to Monitor CPU Usage
router.get("/cpu", async (req, res) => {
  const cpuUsage = checkCPUUsage();
  res.json({ cpuUsage });

  if (cpuUsage > 70) {
    console.log("CPU usage exceeded 70%. Restarting server...");
    exec("pm2 restart all", (err) => {
      if (err) console.error("Error restarting server:", err);
    });
  }
});

module.exports = router;
