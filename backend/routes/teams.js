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
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: "Equipo no encontrado" });
    }

    res.status(200).json(team);
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
        .json({ message: "El campo 'pokemons' debe ser un array" });
    }

    const hasDuplicates =
      new Set(req.body.pokemons).size !== req.body.pokemons.length;
    if (hasDuplicates) {
      return res
        .status(400)
        .json({ message: "Pokémon duplicado en el equipo" });
    }

    // Generar el siguiente _id automáticamente
    const lastTeam = await Team.findOne().sort({ _id: -1 }).lean();
    const newId = lastTeam ? lastTeam._id + 1 : 1;

    const team = new Team({
      _id: newId,
      ...req.body,
    });
    const savedTeam = await team.save();
    res.status(201).json(savedTeam);
  } catch (err) {
    console.error("Error creating team:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT: update (usa findOneAndUpdate en lugar de findByIdAndUpdate)
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Array.isArray(req.body.pokemons)) {
      return res
        .status(400)
        .json({ message: "El campo 'pokemons' debe ser un array" });
    }

    const hasDuplicates =
      new Set(req.body.pokemons).size !== req.body.pokemons.length;
    if (hasDuplicates) {
      return res
        .status(400)
        .json({ message: "Pokémon duplicado en el equipo" });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Equipo no encontrado" });
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
    let deletedTeam = await Team.findByIdAndDelete(id);

    if (!deletedTeam) {
      return res.status(404).json({ message: "Equipo no encontrado" });
    }

    res.status(200).json(deletedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
