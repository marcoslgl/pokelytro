const express = require("express");
const router = express.Router();
const Type = require("../models/Type");
const { post } = require("./pokemons");

// GET: list
router.get("/", async (req, res) => {
  try {
    const types = await Type.find();
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: by attacking and defender type
router.get("/attacking_type/defender_type", async (req, res) => {
  try {
    const { attacking_type, defender_type } = req.params;
    const typeEffectiveness = await Type.find({
      attacking_type,
      defender_type,
    });
    res.status(200).json(typeEffectiveness);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: create
router.post("/", async (req, res) => {
  try {
    const type = new Type(req.body);
    const savedType = await type.save();
    res.status(200).json(savedType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: update
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedType = await Type.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletedType = await Type.findByIdAndDelete(id);
    res.status(200).json(deletedType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
