require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pokemonRoutes = require("./routes/pokemons");
app.use("/api/pokemons", pokemonRoutes);

const typeRoutes = require("./routes/types");
app.use("/api/types", typeRoutes);

const userRoutes = require("./routes/user");
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(PORT, (error) => {
  if (error) {
    console.error("Error starting the server:", error);
  } else {
    console.log(`Server is running on http://localhost:${PORT}`);
  }
});

main().catch((err) => console.error("Failed to connect to MongoDB", err));
async function main() {
  const connectionString =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pokelytro";
  await mongoose.connect(connectionString);
  mongoose.set("strictQuery", true);
  console.log("Connected to MongoDB");
}