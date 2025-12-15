const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET: Listar todos los usuarios
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET: Buscar usuario por ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        user.password = undefined;
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Register (Crear Usuario)
router.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        const token = savedUser.generateAuthToken();
        res.status(201).json({
            user: savedUser,
            token: token
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Login (Ruta Especial para entrar)
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: "Email o contraseña incorrectos" });

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) return res.status(400).json({ message: "Email o contraseña incorrectos" });

        const token = user.generateAuthToken();

        res.status(200).json({
            message: "Login correcto",
            user: { _id: user._id, username: user.username, email: user.email },
            token: token
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT: Actualizar usuario (Ej: Añadir favoritos o equipos)
router.put("/:id", async (req, res) => {
    try {

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Eliminar usuario
router.delete("/:id", async (req, res) => {
    try {
        const deletedUser = await User.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;