const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const HistoricalQueue = require("../models/HistoricalQueue");

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    const results = [];
    const filePath = path.join(__dirname, "../../dataset/synthetic_queue_dataset.csv");

    console.log("Looking for CSV at:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("CSV file not found.");
      process.exit(1);
    }

    fs.createReadStream(filePath)
      .on("error", (err) => {
        console.error("File read error:", err.message);
        process.exit(1);
      })
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          id: Number(data.id),
          date: data.date,
          day_of_week: data.day_of_week,
          arrival_time: data.arrival_time,
          hour: Number(data.hour),
          service_time_minutes: Number(data.service_time_minutes),
          wait_time_minutes: Number(data.wait_time_minutes),
          queue_length: Number(data.queue_length),
          people_ahead: Number(data.people_ahead),
          status: data.status,
          counter_id: data.counter_id,
        });
      })
      .on("end", async () => {
        try {
          console.log("Rows read from CSV:", results.length);

          await HistoricalQueue.deleteMany({});
          await HistoricalQueue.insertMany(results);

          console.log("CSV data imported successfully");
          process.exit(0);
        } catch (error) {
          console.error("MongoDB import error:", error.message);
          process.exit(1);
        }
      });
  } catch (error) {
    console.error("Import script error:", error.message);
    process.exit(1);
  }
};

importData();