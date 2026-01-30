const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// POST: Register (Crear Usuario)
router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();

    const token = savedUser.generateAuthToken();

    res.status(201).json({
      message: "Registro exitoso.",
      user: sanitizeUser(savedUser),
      token: token,
    });
  } catch (err) {
    console.error("Error en la ruta /register:", err);

    let status = 500;
    let message =
      "Error desconocido al registrar el usuario. Intenta de nuevo.";

    if (err.code === 11000) {
      status = 400;
      const field = Object.keys(err.keyPattern)[0];
      message = `El campo '${field}' ya está registrado.`;
    } else if (err.name === "ValidationError") {
      status = 400;
      message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
    }

    res.status(status).json({ message: message });
  }
});

// POST: Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email o contraseña incorrectos" });

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Email o contraseña incorrectos" });

    const token = user.generateAuthToken();

    res.status(200).json({
      message: "Login correcto",
      user: sanitizeUser(user),
      token: token,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error interno del servidor durante el login." });
  }
});

// GET: /profile (Ruta Protegida)
router.get("/profile", protect, async (req, res) => {
  res.status(200).json(req.user);
});

// GET: Listar todos los usuarios
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helpers: asegurar que el usuario autenticado es el propietario
const assertOwner = (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401).json({ message: "No autorizado." });
    return false;
  }
  if (String(req.user._id) !== String(req.params.id)) {
    res
      .status(403)
      .json({ message: "No tienes permiso para acceder a este recurso." });
    return false;
  }
  return true;
};

// GET : Pokemons favoritos de un usuario (PROTEGIDA)
router.get("/:id/favorites", protect, async (req, res) => {
  try {
    if (!assertOwner(req, res)) return;

    const user = await User.findById(req.params.id).select("favorites");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST : Agregar pokemon a favoritos (PROTEGIDA)
router.post("/:id/favorites", protect, async (req, res) => {
  try {
    if (!assertOwner(req, res)) return;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    const { pokemonId } = req.body;
    if (user.favorites.includes(pokemonId)) {
      return res
        .status(400)
        .json({ message: "El Pokémon ya está en favoritos." });
    }
    user.favorites.push(pokemonId);
    await user.save();
    res
      .status(200)
      .json({
        message: "Pokémon agregado a favoritos.",
        favorites: user.favorites,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE : Eliminar pokemon de favoritos (PROTEGIDA)
router.delete("/:id/favorites", protect, async (req, res) => {
  try {
    if (!assertOwner(req, res)) return;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    const { pokemonId } = req.body;
    const index = user.favorites.indexOf(pokemonId);
    if (index === -1) {
      return res
        .status(400)
        .json({ message: "El Pokémon no está en favoritos." });
    }
    user.favorites.splice(index, 1);
    await user.save();
    res
      .status(200)
      .json({
        message: "Pokémon eliminado de favoritos.",
        favorites: user.favorites,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Buscar usuario por ID (RUTA DINÁMICA: DEBE IR DESPUÉS DE LAS RUTAS FIJAS)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT: Actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.id });
    if (deletedUser.deletedCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({ message: "Usuario eliminado correctamente." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
