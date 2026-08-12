const mongoose = require("mongoose");

const queueEntrySchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    peopleAhead: {
      type: Number,
      default: 0,
    },
    position: {
      type: Number,
      default: 1,
    },
    estimatedWaitTime: {
      type: Number,
      default: 0,
    },
    expectedServiceTime: {
      type: String,
      default: "",
    },
    serviceTimeMinutes: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ["waiting", "serving", "served"],
      default: "waiting",
    },
    manuallyUpdated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QueueEntry", queueEntrySchema);
