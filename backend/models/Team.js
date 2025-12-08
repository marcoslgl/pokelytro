const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, required: true },
  pokemons: { type: [Number], required: true }, // Array of Pokemon IDs
});

module.exports = mongoose.model("Team", TeamSchema);
