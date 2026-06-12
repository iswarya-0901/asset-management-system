const express = require("express");
const router = express.Router();

const AuditLog = require("../models/auditLog");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/* ================= GET ALL AUDIT LOGS (ADMIN) ================= */
router.get("/", auth, role(["admin"]), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("performedBy", "name email")
      .populate("targetUser", "name email")
      .populate("asset", "name")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

module.exports = router;