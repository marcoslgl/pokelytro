const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const pokemonRoutes = require("./routes/pokemons");
app.use("/api/pokemons", pokemonRoutes);

const typeRoutes = require("./routes/types");
app.use("/api/types", typeRoutes);

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
    "mongodb+srv://lytronix:ZxB4f4qzCqmnhZs4@cluster0.iwwsild.mongodb.net/?appName=Cluster0";
  await mongoose.connect(connectionString);
  mongoose.set("strictQuery", true);
  console.log("Connected to MongoDB");
}
