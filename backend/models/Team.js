const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  _id: { type: Number },
  name: { type: String, required: true },
  pokemons: { type: [Number], required: true },
});

module.exports = mongoose.model("Team", TeamSchema);
