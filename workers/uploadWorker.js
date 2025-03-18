const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Import Models
const Agent = require("../models/Agent");
const User = require("../models/User");
const Account = require("../models/Account");
const LOB = require("../models/LOB");
const Carrier = require("../models/Carrier");
const Policy = require("../models/Policy");

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/policyDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to Process the File
const processFile = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      // Insert Agent
      let agent = await Agent.findOne({ name: row["Agent Name"] });
      if (!agent) agent = await Agent.create({ name: row["Agent Name"] });

      // Insert User
      let user = await User.findOne({ email: row["Email"] });
      if (!user) {
        user = await User.create({
          firstName: row["First Name"],
          dob: new Date(row["DOB"]),
          address: row["Address"],
          phoneNumber: row["Phone Number"],
          state: row["State"],
          zipCode: row["Zip Code"],
          email: row["Email"],
          gender: row["Gender"],
          userType: row["User Type"],
        });
      }

      // Insert Account
      let account = await Account.findOne({
        accountName: row["Account Name"],
        userId: user._id,
      });
      if (!account)
        account = await Account.create({
          accountName: row["Account Name"],
          userId: user._id,
        });

      // Insert LOB (Policy Category)
      let lob = await LOB.findOne({ categoryName: row["Policy Category"] });
      if (!lob)
        lob = await LOB.create({ categoryName: row["Policy Category"] });

      // Insert Carrier
      let carrier = await Carrier.findOne({
        companyName: row["Policy Carrier"],
      });
      if (!carrier)
        carrier = await Carrier.create({ companyName: row["Policy Carrier"] });

      // Insert Policy
      let policy = await Policy.findOne({ policyNumber: row["Policy Number"] });
      if (!policy) {
        policy = await Policy.create({
          policyNumber: row["Policy Number"],
          policyStartDate: new Date(row["Policy Start Date"]),
          policyEndDate: new Date(row["Policy End Date"]),
          policyCategory: lob._id,
          company: carrier._id,
          user: user._id,
        });
      }
    }

    fs.unlinkSync(filePath); // Delete the file after processing
    parentPort.postMessage("File processed successfully");
  } catch (error) {
    parentPort.postMessage(`Error processing file: ${error.message}`);
  }
};

// Start processing the file
processFile(workerData.filePath);
