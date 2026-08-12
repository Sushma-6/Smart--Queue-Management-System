const express = require("express");
const router = express.Router();
const {
  getPeakHours,
  getPeakDays,
  getDayEstimate,
  getSlotEstimate,
} = require("../controllers/analyticsController");

router.get("/peak-hours", getPeakHours);
router.get("/peak-days", getPeakDays);
router.get("/estimate/:day", getDayEstimate);
router.get("/slot-estimate/:day/:hour", getSlotEstimate);

module.exports = router;
