const express = require("express");
const router = express.Router();

const Booking = require("../models/booking");
const Asset = require("../models/asset");
const AuditLog = require("../models/auditLog");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Allocation = require("../models/allocation");

/* ================= CREATE BOOKING REQUEST (USER) ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { assetId, quantity, purpose, startDate, endDate } = req.body;

    if (!assetId || !quantity || !purpose || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    if (asset.quantity < 1)
      return res.status(400).json({ message: "Asset is fully booked" });

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0)
      return res.status(400).json({ message: "Invalid quantity" });
    if (qty > asset.quantity)
      return res.status(400).json({ message: `Only ${asset.quantity} units available` });

    const booking = new Booking({
      asset: assetId,
      bookedBy: req.user.id,
      quantity: qty,
      purpose,
      startDate,
      endDate,
      status: "pending",
    });

    await booking.save();
    await booking.populate("asset", "name type");

    res.status(201).json({ message: "Booking request submitted", booking });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ message: "Failed to submit booking request" });
  }
});

/* ================= MY BOOKINGS (USER) ================= */
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ bookedBy: req.user.id })
      .populate("asset", "name type")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

/* ================= ALL PENDING BOOKINGS (ADMIN) ================= */
router.get("/pending", auth, role(["admin"]), async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" })
      .populate("asset", "name type quantity")
      .populate("bookedBy", "name email")
      .sort({ createdAt: -1 });

    // Filter out bookings where the asset was deleted
    const filtered = bookings.filter((b) => b.asset !== null);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending bookings" });
  }
});

/* ================= ALL BOOKINGS (ADMIN) ================= */
router.get("/all", auth, role(["admin"]), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("asset", "name type quantity")
      .populate("bookedBy", "name email")
      .sort({ createdAt: -1 });

    // Filter out bookings where the asset was deleted
    const filtered = bookings.filter((b) => b.asset !== null);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch all bookings" });
  }
});

/* ================= APPROVE BOOKING (ADMIN) ================= */
router.put("/:id/approve", auth, role(["admin"]), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("asset");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "pending")
      return res.status(400).json({ message: "Booking already reviewed" });

    const asset = await Asset.findById(booking.asset._id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    if (booking.quantity > asset.quantity) {
      return res.status(400).json({
        message: `Only ${asset.quantity} units available now. Cannot approve.`,
      });
    }

    asset.quantity -= booking.quantity;
    if (asset.quantity === 0) asset.status = "booked";
    await asset.save();

    booking.status = "approved";
    booking.reviewedBy = req.user.id;
    booking.reviewedAt = new Date();
    await booking.save();
    await booking.populate("bookedBy", "name email");

    await Allocation.create({
      asset: asset._id,
      allocatedTo: booking.bookedBy._id,
      allocatedBy: req.user.id,
      quantity: booking.quantity,
      dueDate: booking.endDate,
      status: "active",
    });
    // Audit log
    await AuditLog.create({
      action: "BOOKING_APPROVED",
      performedBy: req.user.id,
      targetUser: booking.bookedBy._id,
      asset: asset._id,
      details: `Approved booking of ${booking.quantity} x ${asset.name}`,
    });

    res.json({ message: "Booking approved", booking });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Failed to approve booking" });
  }
});

/* ================= REJECT BOOKING (ADMIN) ================= */
router.put("/:id/reject", auth, role(["admin"]), async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "pending")
      return res.status(400).json({ message: "Booking already reviewed" });

    booking.status = "rejected";
    booking.reviewedBy = req.user.id;
    booking.reviewedAt = new Date();
    booking.rejectionReason = reason || null;
    await booking.save();

    await booking.populate("asset", "name type");
    await booking.populate("bookedBy", "name email");

    // Audit log
    await AuditLog.create({
      action: "BOOKING_REJECTED",
      performedBy: req.user.id,
      targetUser: booking.bookedBy._id,
      asset: booking.asset._id,
      details: `Rejected booking of ${booking.quantity} x ${booking.asset.name}${reason ? `. Reason: ${reason}` : ""}`,
    });

    res.json({ message: "Booking rejected", booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject booking" });
  }
});

module.exports = router;