require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// Importar rutas del backend
const userRoutes = require("../backend/routes/user");
const pokemonRoutes = require("../backend/routes/pokemons");
const teamRoutes = require("../backend/routes/teams");
const typeRoutes = require("../backend/routes/types");

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/pokemons", pokemonRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/types", typeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
