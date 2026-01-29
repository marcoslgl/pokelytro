const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, required: true },
  pokemons: { type: [Number], required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Team", TeamSchema);
