const express = require("express");
const router = express.Router();

const Asset = require("../models/asset");
const Booking = require("../models/booking");
const Allocation = require("../models/allocation");
const User = require("../models/user");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/* ================= SUMMARY STATS (ADMIN) ================= */
router.get("/summary", auth, role(["admin"]), async (req, res) => {
  try {
    const [assets, bookings, allocations, users] = await Promise.all([
      Asset.find(),
      Booking.find(),
      Allocation.find(),
      User.find(),
    ]);

    const totalAssets = assets.reduce((s, a) => s + (a.totalQuantity || a.quantity), 0);
    const availableQty = assets.reduce((s, a) => s + a.quantity, 0);
    const bookedQty = totalAssets - availableQty;

    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const approvedBookings = bookings.filter((b) => b.status === "approved").length;
    const rejectedBookings = bookings.filter((b) => b.status === "rejected").length;
    const activeAllocations = allocations.filter((a) => a.status === "active").length;

    // Overdue allocations
    const now = new Date();
    const overdueAllocations = allocations.filter(
      (a) => a.status === "active" && new Date(a.dueDate) < now
    ).length;

    res.json({
      totalAssets,
      availableQty,
      bookedQty,
      totalUsers: users.length,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      activeAllocations,
      overdueAllocations,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

/* ================= BOOKINGS PER ASSET (ADMIN) ================= */
router.get("/bookings-per-asset", auth, role(["admin"]), async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "approved" }).populate("asset", "name");
    const map = {};
    bookings.forEach((b) => {
      const name = b.asset?.name || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    const data = Object.entries(map).map(([name, count]) => ({ name, count }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch data" });
  }
});

/* ================= BOOKINGS OVER LAST 7 DAYS (ADMIN) ================= */
router.get("/bookings-trend", auth, role(["admin"]), async (req, res) => {
  try {
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const count = await Booking.countDocuments({
        createdAt: { $gte: start, $lte: end },
      });

      result.push({
        date: start.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        bookings: count,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trend" });
  }
});

module.exports = router;