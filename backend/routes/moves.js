const express = require("express");
const router = express.Router();
const Move = require("../models/moves");

// GET: list
router.get("/", async (req, res) => {
  try {
    const moves = await Move.find().sort({ name: 1 });
    res.status(200).json(moves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const move = await Move.findOne({ _id: id });
    res.status(200).json(move);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: create
router.post("/", async (req, res) => {
  try {
    const move = new Move(req.body);
    const savedMove = await move.save();
    res.status(200).json(savedMove);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: update
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedMove = await Move.findByIdAndUpdate({ _id: id }, { $set: req.body }, { new: true });
    res.status(200).json(updatedMove);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let deletedMove = await Move.deleteOne({ _id: id });
    res.status(200).json(deletedMove);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
