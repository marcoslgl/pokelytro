const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AbilitySchema = new Schema(
  {
    name: { type: String, required: true },
    is_hidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const DexEntrySchema = new Schema(
  {
    dex_name: { type: String, required: true },
    dex_number: Number,
  },
  { _id: false }
);

const EVSchema = new Schema(
  {
    hp: Number,
    attack: Number,
    defense: Number,
    special_attack: Number,
    special_defense: Number,
    speed: Number,
  },
  { _id: false }
);

const EvolutionSchema = new Schema(
  {
    to: { type: Schema.Types.ObjectId, ref: "Pokemon" },
    method: String,
  },
  { _id: false }
);

const PokemonSchema = new Schema(
  {
    name: { type: String, required: true },
    height_ft: Number,
    height_m: Number,
    weight_lbs: Number,
    weight_kg: Number,
    base_stats: {
      hp: Number,
      attack: Number,
      defense: Number,
      special_attack: Number,
      special_defense: Number,
      speed: Number,
      total: Number,
    },
    base_experience: Number,
    catch_rate: Number,
    base_friendship: Number,
    growth_rate: String,
    pokedex_color: String,
    gender_ratio: String,

    // Arrays embebidos
    types: [String],
    abilities: [AbilitySchema],
    evs: EVSchema,
    dex_numbers: [DexEntrySchema],
    egg_groups: [String],
    evolutions: [EvolutionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pokemon", PokemonSchema);
