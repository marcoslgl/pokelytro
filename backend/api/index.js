require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:4200",
    "https://pokelytro.vercel.app",
    /\.vercel\.app$/,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Conectar a MongoDB
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// Importar rutas del backend
const userRoutes = require("../routes/user");
const pokemonRoutes = require("../routes/pokemons");
const teamRoutes = require("../routes/teams");
const typeRoutes = require("../routes/types");

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
