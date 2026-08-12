const HistoricalQueue = require("../models/HistoricalQueue");

const getPeakHours = async (req, res) => {
  try {
    const data = await HistoricalQueue.aggregate([
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 },
          avgWaitTime: { $avg: "$wait_time_minutes" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPeakDays = async (req, res) => {
  try {
    const data = await HistoricalQueue.aggregate([
      {
        $group: {
          _id: "$day_of_week",
          count: { $sum: 1 },
          avgWaitTime: { $avg: "$wait_time_minutes" },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDayEstimate = async (req, res) => {
  try {
    const { day } = req.params;

    const data = await HistoricalQueue.aggregate([
      {
        $match: {
          day_of_week: day,
        },
      },
      {
        $group: {
          _id: "$day_of_week",
          avgQueueLength: { $avg: "$queue_length" },
          avgWaitTime: { $avg: "$wait_time_minutes" },
          totalEntries: { $sum: 1 },
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({ message: "No data found for selected day" });
    }

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSlotEstimate = async (req, res) => {
  try {
    const { day, hour } = req.params;
    const hourNumber = Number(hour);

    if (Number.isNaN(hourNumber)) {
      return res.status(400).json({ message: "Invalid hour value" });
    }

    const slotData = await HistoricalQueue.aggregate([
      {
        $match: {
          day_of_week: day,
          hour: hourNumber,
        },
      },
      {
        $group: {
          _id: { day: "$day_of_week", hour: "$hour" },
          avgQueueLength: { $avg: "$queue_length" },
          avgWaitTime: { $avg: "$wait_time_minutes" },
          totalEntries: { $sum: 1 },
        },
      },
    ]);

    if (!slotData.length) {
      return res.status(404).json({ message: "No data found for selected slot" });
    }

    const selected = slotData[0];

    const allDaySlots = await HistoricalQueue.aggregate([
      {
        $match: {
          day_of_week: day,
        },
      },
      {
        $group: {
          _id: "$hour",
          avgQueueLength: { $avg: "$queue_length" },
          avgWaitTime: { $avg: "$wait_time_minutes" },
          totalEntries: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (!allDaySlots.length) {
      return res.status(404).json({ message: "No slot data available for this day" });
    }

    const overallAvgWait =
      allDaySlots.reduce((sum, slot) => sum + slot.avgWaitTime, 0) /
      allDaySlots.length;

    const isGoodSlot = selected.avgWaitTime <= overallAvgWait;

    let suggestedSlot = null;

    if (!isGoodSlot) {
      const betterSlots = allDaySlots.filter(
        (slot) => slot.avgWaitTime < selected.avgWaitTime
      );

      if (betterSlots.length > 0) {
        betterSlots.sort(
          (a, b) =>
            Math.abs(a._id - hourNumber) - Math.abs(b._id - hourNumber)
        );
        suggestedSlot = betterSlots[0];
      }
    }

    res.json({
      day,
      hour: hourNumber,
      avgQueueLength: selected.avgQueueLength,
      avgWaitTime: selected.avgWaitTime,
      totalEntries: selected.totalEntries,
      isGoodSlot,
      message: isGoodSlot
        ? "This is a good slot. You can go ahead."
        : "This is a rush hour slot.",
      suggestedSlot: suggestedSlot
        ? {
            hour: suggestedSlot._id,
            avgQueueLength: suggestedSlot.avgQueueLength,
            avgWaitTime: suggestedSlot.avgWaitTime,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPeakHours,
  getPeakDays,
  getDayEstimate,
  getSlotEstimate,
};
