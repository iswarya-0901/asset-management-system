const express = require("express");
const router = express.Router();

const User = require("../models/user");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/* ================= GET ALL USERS (ADMIN) ================= */
router.get("/", auth, role(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ================= DELETE USER (ADMIN) ================= */
router.delete("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;