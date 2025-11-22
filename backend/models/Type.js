const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TypeSchema = new Schema({
  attacking_type: { type: String, required: true },
  defender_type: { type: String, required: true },
  multiplier: { type: Number, required: true },
});

module.exports = mongoose.model("types", TypeSchema);
