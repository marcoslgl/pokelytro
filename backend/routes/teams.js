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
    const id = parseInt(req.params.id, 10);
    const team = await Team.findOne({ id: id });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

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

// PUT: update (usa findOneAndUpdate en lugar de findByIdAndUpdate)
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedTeam = await Team.findOneAndUpdate(
      { id: id }, // Buscar por el campo 'id'
      { $set: req.body },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(updatedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: delete
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    let deletedTeam = await Team.deleteOne({ id: id });

    if (deletedTeam.deletedCount === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(deletedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
