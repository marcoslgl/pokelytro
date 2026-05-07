const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const mongoose = require("mongoose");

function normalizePokemons(pokemons) {
  if (!Array.isArray(pokemons)) {
    return { error: "The 'pokemons' field must be an array" };
  }

  const normalized = [];

  for (const pokemonEntry of pokemons) {
    if (typeof pokemonEntry === "number") {
      normalized.push({ pokemonId: pokemonEntry, moves: [] });
      continue;
    }

    if (pokemonEntry && typeof pokemonEntry === "object") {
      const pokemonId = Number(pokemonEntry.pokemonId);

      if (!Number.isFinite(pokemonId)) {
        return {
          error: "Each pokemon must include a valid numeric 'pokemonId'",
        };
      }

      const moves = pokemonEntry.moves ?? [];

      if (!Array.isArray(moves)) {
        return { error: "The 'moves' field must be an array" };
      }

      if (moves.length > 4) {
        return { error: "Each pokemon can have up to 4 moves" };
      }

      normalized.push({ pokemonId, moves });
      continue;
    }

    return {
      error:
        "Each pokemon entry must be a number or an object with 'pokemonId' and optional 'moves'",
    };
  }

  const pokemonIds = normalized.map((entry) => entry.pokemonId);
  const hasDuplicates = new Set(pokemonIds).size !== pokemonIds.length;

  if (hasDuplicates) {
    return { error: "Duplicate Pokemon in the team" };
  }

  return { value: normalized };
}

// GET: list
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

// POST: create
router.post("/", async (req, res) => {
  try {
    const normalizedPokemons = normalizePokemons(req.body.pokemons);
    if (normalizedPokemons.error) {
      return res.status(400).json({ message: normalizedPokemons.error });
    }

    const team = new Team({
      ...req.body,
      pokemons: normalizedPokemons.value,
    });
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

    if (req.body.pokemons !== undefined) {
      const normalizedPokemons = normalizePokemons(req.body.pokemons);
      if (normalizedPokemons.error) {
        return res.status(400).json({ message: normalizedPokemons.error });
      }

      updateData.pokemons = normalizedPokemons.value;
    }

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

// POST: add move to a pokemon in team
router.post("/:id/pokemons/:pokemonId/moves", async (req, res) => {
  try {
    const { moveId } = req.body;

    if (!moveId || !mongoose.Types.ObjectId.isValid(moveId)) {
      return res.status(400).json({ message: "A valid 'moveId' is required" });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const pokemonId = Number(req.params.pokemonId);
    if (!Number.isFinite(pokemonId)) {
      return res.status(400).json({ message: "Invalid pokemonId" });
    }
    const teamPokemon = team.pokemons.find(
      (entry) => entry.pokemonId === pokemonId,
    );

    if (!teamPokemon) {
      return res
        .status(404)
        .json({ message: "Pokemon not found in this team" });
    }

    const moveIdStr = String(moveId);
    const alreadyAdded = teamPokemon.moves.some(
      (move) => String(move) === moveIdStr,
    );
    if (alreadyAdded) {
      return res
        .status(400)
        .json({ message: "This move is already in the pokemon move set" });
    }

    if (teamPokemon.moves.length >= 4) {
      return res
        .status(400)
        .json({ message: "Each pokemon can have up to 4 moves" });
    }

    teamPokemon.moves.push(moveId);
    await team.save();

    res.status(200).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: remove move from a pokemon in team
router.delete("/:id/pokemons/:pokemonId/moves/:moveId", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const pokemonId = Number(req.params.pokemonId);
    if (!Number.isFinite(pokemonId)) {
      return res.status(400).json({ message: "Invalid pokemonId" });
    }
    const teamPokemon = team.pokemons.find(
      (entry) => entry.pokemonId === pokemonId,
    );

    if (!teamPokemon) {
      return res
        .status(404)
        .json({ message: "Pokemon not found in this team" });
    }

    const moveIdStr = String(req.params.moveId);
    const originalLength = teamPokemon.moves.length;
    teamPokemon.moves = teamPokemon.moves.filter(
      (move) => String(move) !== moveIdStr,
    );

    if (teamPokemon.moves.length === originalLength) {
      return res
        .status(404)
        .json({ message: "Move not found in this pokemon" });
    }

    await team.save();

    res.status(200).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH: replace move in a pokemon in team
router.patch("/:id/pokemons/:pokemonId/moves/:moveId", async (req, res) => {
  try {
    const { newMoveId } = req.body;

    if (!newMoveId || !mongoose.Types.ObjectId.isValid(newMoveId)) {
      return res
        .status(400)
        .json({ message: "A valid 'newMoveId' is required" });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const pokemonId = Number(req.params.pokemonId);
    if (!Number.isFinite(pokemonId)) {
      return res.status(400).json({ message: "Invalid pokemonId" });
    }

    const teamPokemon = team.pokemons.find(
      (entry) => entry.pokemonId === pokemonId,
    );

    if (!teamPokemon) {
      return res
        .status(404)
        .json({ message: "Pokemon not found in this team" });
    }

    const oldMoveId = String(req.params.moveId);
    const oldMoveIndex = teamPokemon.moves.findIndex(
      (move) => String(move) === oldMoveId,
    );

    if (oldMoveIndex === -1) {
      return res
        .status(404)
        .json({ message: "Move not found in this pokemon" });
    }

    const newMoveIdStr = String(newMoveId);
    const alreadyExists = teamPokemon.moves.some(
      (move, index) => index !== oldMoveIndex && String(move) === newMoveIdStr,
    );

    if (alreadyExists) {
      return res
        .status(400)
        .json({ message: "This move is already in the pokemon move set" });
    }

    teamPokemon.moves[oldMoveIndex] = newMoveId;
    await team.save();

    res.status(200).json(team);
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
