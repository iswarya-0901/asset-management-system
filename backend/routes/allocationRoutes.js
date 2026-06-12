const express = require("express");
const router = express.Router();

const Allocation = require("../models/allocation");
const Asset = require("../models/asset");
const AuditLog = require("../models/auditLog");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/* ================= CREATE ALLOCATION (ADMIN) ================= */
router.post("/", auth, role(["admin"]), async (req, res) => {
  try {
    const { assetId, userId, quantity, dueDate } = req.body;

    if (!assetId || !userId || !quantity || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0)
      return res.status(400).json({ message: "Invalid quantity" });
    if (qty > asset.quantity)
      return res.status(400).json({ message: `Only ${asset.quantity} units available` });

    // Deduct from asset
    asset.quantity -= qty;
    if (asset.quantity === 0) asset.status = "booked";
    await asset.save();

    const allocation = new Allocation({
      asset: assetId,
      allocatedTo: userId,
      allocatedBy: req.user.id,
      quantity: qty,
      dueDate,
    });
    await allocation.save();
    await allocation.populate("asset", "name type");
    await allocation.populate("allocatedTo", "name email");

    // Audit log
    await AuditLog.create({
      action: "ASSET_ALLOCATED",
      performedBy: req.user.id,
      targetUser: userId,
      asset: assetId,
      details: `Allocated ${qty} x ${asset.name} to user`,
    });

    res.status(201).json({ message: "Asset allocated", allocation });
  } catch (err) {
    console.error("ALLOCATE ERROR:", err);
    res.status(500).json({ message: "Failed to allocate asset" });
  }
});

/* ================= GET ALL ACTIVE ALLOCATIONS (ADMIN) ================= */
/* ================= GET ALL ACTIVE ALLOCATIONS (ADMIN) ================= */
router.get("/", auth, role(["admin"]), async (req, res) => {
  try {
    const all = await Allocation.find();
    console.log("TOTAL ALLOCATIONS IN DB:", all.length);
    console.log("ALLOCATION DATA:", JSON.stringify(all, null, 2));

    const allocations = await Allocation.find({ status: "active" })
      .populate("asset", "name type")
      .populate("allocatedTo", "name email")
      .populate("allocatedBy", "name")
      .sort({ createdAt: -1 });

    console.log("ACTIVE ALLOCATIONS:", allocations.length);
    res.json(allocations);
  } catch (err) {
    console.log("ALLOC ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// TEMPORARY DEBUG ROUTE - remove after fixing
router.get("/debug", auth, role(["admin"]), async (req, res) => {
  try {
    const all = await Allocation.find();
    res.json({
      total: all.length,
      data: all
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});
/* ================= MARK RETURNED (ADMIN) ================= */
router.put("/:id/return", auth, role(["admin"]), async (req, res) => {
  try {
    const { condition } = req.body;

    const allocation = await Allocation.findById(req.params.id).populate("asset");
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });
    if (allocation.status === "returned")
      return res.status(400).json({ message: "Already returned" });

    // Restore asset quantity
    const asset = await Asset.findById(allocation.asset._id);
    if (asset) {
      asset.quantity += allocation.quantity;
      asset.status = "available";
      await asset.save();
    }

    allocation.status = "returned";
    allocation.returnedAt = new Date();
    if (condition) allocation.condition = condition;
    await allocation.save();

    // Audit log
    await AuditLog.create({
      action: "ASSET_RETURNED",
      performedBy: req.user.id,
      targetUser: allocation.allocatedTo,
      asset: allocation.asset._id,
      details: `Returned ${allocation.quantity} x ${allocation.asset.name} (Condition: ${condition || allocation.condition})`,
    });

    res.json({ message: "Marked as returned", allocation });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as returned" });
  }
});

module.exports = router;