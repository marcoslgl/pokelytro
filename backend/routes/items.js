const express = require("express");
const router = express.Router();
const Item = require("../models/items");

// GET: list
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findOne({ _id: id });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: create
router.post("/", async (req, res) => {
  try {
    const item = new Item(req.body);
    const savedItem = await item.save();
    res.status(200).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: update
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedItem = await Item.findByIdAndUpdate({ _id: id }, { $set: req.body }, { new: true });
    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let deletedItem = await Item.deleteOne({ _id: id });
    res.status(200).json(deletedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
