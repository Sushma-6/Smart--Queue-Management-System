const mongoose = require("mongoose");

const historicalQueueSchema = new mongoose.Schema(
  {
    id: Number,
    date: String,
    day_of_week: String,
    arrival_time: String,
    hour: Number,
    service_time_minutes: Number,
    wait_time_minutes: Number,
    queue_length: Number,
    people_ahead: Number,
    status: String,
    counter_id: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("HistoricalQueue", historicalQueueSchema);