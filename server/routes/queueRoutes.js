const express = require("express");
const router = express.Router();
const {
  joinQueue,
  getQueueStatus,
  callNext,
  updateWaitTime,
  getAdminDashboard,
} = require("../controllers/queueController");

router.post("/join", joinQueue);
router.get("/status/:phone", getQueueStatus);
router.get("/admin", getAdminDashboard);
router.put("/call-next", callNext);
router.put("/update-wait/:id", updateWaitTime);

module.exports = router;