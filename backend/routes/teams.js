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
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(team);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID format" });
  }
});

//GET : by userId
router.get("/user/:userId", async (req, res) => {
  try {
    const teams = await Team.find({ userId: req.params.userId });
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: create
router.post("/", async (req, res) => {
  try {
    if (!Array.isArray(req.body.pokemons)) {
      return res
        .status(400)
        .json({ message: "The 'pokemons' field must be an array" });
    }

    const hasDuplicates =
      new Set(req.body.pokemons).size !== req.body.pokemons.length;

    if (hasDuplicates) {
      return res.status(400).json({ message: "Duplicate Pokémon in the team" });
    }

    const team = new Team(req.body);
    const savedTeam = await team.save();

    res.status(201).json(savedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: update
router.put("/:id", async (req, res) => {
  try {
    const updateData = {};

    // Validar pokemons SOLO si vienen
    if (req.body.pokemons !== undefined) {
      if (!Array.isArray(req.body.pokemons)) {
        return res
          .status(400)
          .json({ message: "The 'pokemons' field must be an array" });
      }

      const hasDuplicates =
        new Set(req.body.pokemons).size !== req.body.pokemons.length;

      if (hasDuplicates) {
        return res
          .status(400)
          .json({ message: "Duplicate Pokémon in the team" });
      }

      updateData.pokemons = req.body.pokemons;
    }

    // Validar nombre SOLO si viene
    if (req.body.name !== undefined) {
      updateData.name = req.body.name;
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
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
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);

    if (!deletedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(deletedTeam);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID format" });
  }
});

module.exports = router;
