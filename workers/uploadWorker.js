const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");

// Import Models
const Agent = require("../models/Agent");
const User = require("../models/User");
const Account = require("../models/Account");
const LOB = require("../models/LOB");
const Carrier = require("../models/Carrier");
const Policy = require("../models/Policy");

// MongoDB Connection
const connectDB = require("../config/db");

async function processFile(filePath) {
  try {
    console.log(`📂 Processing file: ${filePath}`);

    // Ensure DB connection is established
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Load and parse the file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!data.length) {
      throw new Error("Excel file is empty or not formatted correctly");
    }

    console.log(`📊 Extracted ${data.length} rows`);

    for (const row of data) {
      try {
        // Validate and Insert Agent Data
        let agent = row["agent"]
          ? await Agent.findOneAndUpdate(
              { name: row["agent"] },
              { name: row["agent"] },
              { upsert: true, new: true }
            )
          : null;

        // Validate and Insert User Data
        if (!row["firstname"] || !row["dob"] || !row["email"]) {
          console.warn("⚠️ Skipping row - Missing Required User Fields:", row);
          continue;
        }

        let user = await User.findOneAndUpdate(
          { email: row["email"] },
          {
            firstName: row["firstname"],
            dob: new Date(row["dob"]),
            address: row["address"] || "",
            phone: row["phone"] || "",
            state: row["state"] || "",
            zipCode: row["zip"] || "",
            gender: row["gender"] || "",
            userType: row["userType"] || "",
          },
          { upsert: true, new: true }
        );

        // Validate and Insert Account Data
        let account = row["account_name"]
          ? await Account.findOneAndUpdate(
              { accountName: row["account_name"] },
              { accountName: row["account_name"] },
              { upsert: true, new: true }
            )
          : null;

        // Validate and Insert LOB (Policy Category)
        let lob = row["category_name"]
          ? await LOB.findOneAndUpdate(
              { categoryName: row["category_name"] },
              { categoryName: row["category_name"] },
              { upsert: true, new: true }
            )
          : null;

        // Validate and Insert Carrier
        let carrier = row["company_name"]
          ? await Carrier.findOneAndUpdate(
              { companyName: row["company_name"] },
              { companyName: row["company_name"] },
              { upsert: true, new: true }
            )
          : null;

        // Validate and Insert Policy
        if (
          !row["policy_number"] ||
          !row["policy_start_date"] ||
          !row["policy_end_date"]
        ) {
          console.warn(
            "⚠️ Skipping row - Missing Required Policy Fields:",
            row
          );
          continue;
        }

        await Policy.create({
          policyNumber: row["policy_number"],
          policyStartDate: new Date(row["policy_start_date"]),
          policyEndDate: new Date(row["policy_end_date"]),
          policyCategory: lob ? lob._id : null,
          company: carrier ? carrier._id : null,
          user: user._id,
        });

        console.log("✅ Inserted row successfully:", row);
      } catch (rowError) {
        console.error("❌ Error processing row:", rowError.message);
      }
    }

    console.log("🎉 File processing completed successfully");
    parentPort.postMessage({ message: "File processed successfully" });
  } catch (error) {
    console.error("❌ Error processing file:", error.message);
    parentPort.postMessage({
      message: "Error processing file",
      error: error.message,
    });
  } finally {
    mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Start processing
processFile(workerData.filePath);
