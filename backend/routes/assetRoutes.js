const express = require("express");
const router = express.Router();

const Asset = require("../models/asset");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

/* ================= CREATE ASSET (ADMIN) ================= */
router.post("/add", auth, role(["admin"]), async (req, res) => {
  try {
    const asset = new Asset({
      ...req.body,
      totalQuantity: req.body.quantity,
    });
    await asset.save();
    res.json({ message: "Asset created", asset });
  } catch (err) {
    res.status(500).json({ message: "Error creating asset" });
  }
});

/* ================= GET ALL ================= */
router.get("/", auth, async (req, res) => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assets" });
  }
});

/* ================= UPDATE ASSET (ADMIN) ================= */
router.put("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Updated", asset: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating asset" });
  }
});

/* ================= DELETE (ADMIN) ================= */
router.delete("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting asset" });
  }
});

module.exports = router;