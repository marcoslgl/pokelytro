const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamPokemonSchema = new Schema(
  {
    pokemonId: { type: Number, required: true },
    moves: {
      type: [{ type: Schema.Types.ObjectId, ref: "moves" }],
      default: [],
      validate: {
        validator: (moves) => moves.length <= 4,
        message: "A Pokemon cannot have more than 4 moves",
      },
    },
  },
  { _id: false },
);

const TeamSchema = new Schema({
  name: { type: String, required: true },
  pokemons: { type: [teamPokemonSchema], required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Team", TeamSchema);
