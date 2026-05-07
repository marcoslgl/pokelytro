const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  gen: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("items", itemSchema);
