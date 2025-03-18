const express = require("express");
const Policy = require("../models/Policy");
const User = require("../models/User");

const router = express.Router();

// API to Search Policy by Username
router.get("/search", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const user = await User.findOne({ firstName: username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const policies = await Policy.find({ user: user._id }).populate(
      "policyCategory company user"
    );
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching policy", error });
  }
});

// API to Get Aggregated Policy Data Per User
router.get("/aggregate", async (req, res) => {
  try {
    const aggregation = await Policy.aggregate([
      {
        $group: {
          _id: "$user",
          totalPolicies: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
    ]);

    res.json(aggregation);
  } catch (error) {
    res.status(500).json({ message: "Error aggregating policy data", error });
  }
});

module.exports = router;
