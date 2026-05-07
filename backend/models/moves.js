const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const moveSchema = Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  power: {
    type: Number,
    required: true,
  },
  damage_class: {
    type: String,
    required: true,
  },
  accuracy: {
    type: Number,
  },
  pp: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  learned_by_ids: {
    type: [Number],
    required: true,
  },
});

module.exports = mongoose.model("moves", moveSchema);
