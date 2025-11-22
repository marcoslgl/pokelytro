const express = require("express");
const router = express.Router();
const Pokemon = require("../models/Pokemon");

// GET: list
router.get("/", async (req, res) => {
  try {
    const pokemons = await Pokemon.find();
    res.status(200).json(pokemons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const pokemon = await Pokemon.findOne({ _id: id });
    res.status(200).json(pokemon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: create
router.post("/", async (req, res) => {
  try {
    const pokemon = new Pokemon(req.body);
    const savedPokemon = await pokemon.save();
    res.status(200).json(savedPokemon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: update
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPokemon = await Pokemon.findByIdAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPokemon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: delete
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let deletedPokemon = await Pokemon.deleteOne({ _id: id });
    res.status(200).json(deletedPokemon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
