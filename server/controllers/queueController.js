const QueueEntry = require("../models/QueueEntry");

const DEFAULT_SERVICE_TIME = 10;

const joinQueue = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const waitingUsers = await QueueEntry.find({
      status: { $in: ["waiting", "serving"] },
    }).sort({ tokenNumber: 1 });

    const lastEntry = await QueueEntry.findOne().sort({ tokenNumber: -1 });
    const tokenNumber = lastEntry ? lastEntry.tokenNumber + 1 : 1;

    const peopleAhead = waitingUsers.filter(
      (user) => user.status === "waiting" || user.status === "serving"
    ).length;

    const position = peopleAhead + 1;
    const estimatedWaitTime = peopleAhead * DEFAULT_SERVICE_TIME;

    const expectedTime = new Date(Date.now() + estimatedWaitTime * 60000);
    const expectedServiceTime = expectedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newEntry = await QueueEntry.create({
      tokenNumber,
      name,
      phone,
      peopleAhead,
      position,
      estimatedWaitTime,
      expectedServiceTime,
      serviceTimeMinutes: DEFAULT_SERVICE_TIME,
      status: "waiting",
    });

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQueueStatus = async (req, res) => {
  try {
    const { phone } = req.params;

    const user = await QueueEntry.findOne({
      phone,
      status: { $in: ["waiting", "serving"] },
    }).sort({ createdAt: -1 });

    if (!user) {
      return res.status(404).json({ message: "No active queue entry found" });
    }

    const activeQueue = await QueueEntry.find({
      status: { $in: ["waiting", "serving"] },
    }).sort({ tokenNumber: 1 });

    const aheadUsers = activeQueue.filter(
      (entry) => entry.tokenNumber < user.tokenNumber
    );

    const peopleAhead = aheadUsers.length;

    let estimatedWaitTime = 0;
    for (const entry of aheadUsers) {
      estimatedWaitTime += Number(entry.serviceTimeMinutes || 10);
    }

    const expectedTime = new Date(Date.now() + estimatedWaitTime * 60000);
    const expectedServiceTime = expectedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    user.peopleAhead = peopleAhead;
    user.position = peopleAhead + 1;
    user.estimatedWaitTime = estimatedWaitTime;
    user.expectedServiceTime = expectedServiceTime;

    await user.save();

    return res.json(user);
  } catch (error) {
    console.error("getQueueStatus error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const callNext = async (req, res) => {
  try {
    await QueueEntry.updateMany(
      { status: "serving" },
      { $set: { status: "served" } }
    );

    const nextUser = await QueueEntry.findOne({ status: "waiting" }).sort({
      tokenNumber: 1,
    });

    if (!nextUser) {
      return res.status(404).json({ message: "No waiting users in queue" });
    }

    nextUser.status = "serving";
    await nextUser.save();

    res.json({ message: "Next user is now serving", nextUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWaitTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceTimeMinutes } = req.body;

    const entry = await QueueEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Queue entry not found" });
    }

    const newTime = Number(serviceTimeMinutes);

    if (!newTime || newTime <= 0) {
      return res
        .status(400)
        .json({ message: "Service time must be a positive number" });
    }

    entry.serviceTimeMinutes = newTime;
    entry.manuallyUpdated = true;
    await entry.save();

    return res.json({
      message: "Wait time updated successfully",
      entry,
    });
  } catch (error) {
    console.error("updateWaitTime error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const waitingList = await QueueEntry.find({
      status: { $in: ["waiting", "serving"] },
    }).sort({ tokenNumber: 1 });

    const currentlyServing = await QueueEntry.findOne({ status: "serving" });
    const totalServed = await QueueEntry.countDocuments({ status: "served" });

    res.json({
      waitingList,
      currentlyServing,
      totalServed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  joinQueue,
  getQueueStatus,
  callNext,
  updateWaitTime,
  getAdminDashboard,
};