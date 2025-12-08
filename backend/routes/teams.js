const express = require("express");
const router = express.Router();
const Team = require("../models/Team");

// GET: list
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET: by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const team = await Team.findOne({ _id: id });
    res.status(200).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST: create
router.post("/", async (req, res) => {
  try {
    const team = new Team(req.body);
    const savedTeam = await team.save();
    res.status(200).json(savedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// PUT: update
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedTeam = await Team.findByIdAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// DELETE: delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let deletedTeam = await Team.deleteOne({ _id: id });
    res.status(200).json(deletedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
